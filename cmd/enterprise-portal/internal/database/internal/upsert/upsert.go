package upsert

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Trick to avoid user-provided string values - outside this package, this type
// can only be fulfilled by a constant string value.
type constString string

type Builder struct {
	table      constString
	primaryKey constString

	insertColumns []string
	args          pgx.NamedArgs
	updateColumns []string

	forceUpdate bool
}

// New instantiates an upsert.Builder that can be used with `upsert.Field(b, ...)`
// to implement the database layer for the upsert pattern common in gRPC 'update',
// methods, per the AIP: https://google.aip.dev/134
func New(table, primaryKey constString, forceUpdate bool) *Builder {
	return &Builder{
		table:       table,
		primaryKey:  primaryKey,
		forceUpdate: forceUpdate,
		args:        pgx.NamedArgs{},
	}
}

type fieldOptions struct {
	useColumnDefault    bool
	ignoreOnForceUpdate bool
}

type fieldOptionFn func(*fieldOptions)

func (fn fieldOptionFn) apply(opt *fieldOptions) { fn(opt) }

type FieldOption interface {
	apply(*fieldOptions)
}

// WithColumnDefault indicates that the field should not be included in an upsert
// if the field has a zero value, which allows the column default to be used.
//
// It does NOT apply in a force update.
func WithColumnDefault() FieldOption {
	return fieldOptionFn(func(opt *fieldOptions) { opt.useColumnDefault = true })
}

// WithIgnoreOnForceUpdate indicates that the field should not be updated when
// performing a force update.
func WithIgnoreOnForceUpdate() FieldOption {
	return fieldOptionFn(func(opt *fieldOptions) { opt.ignoreOnForceUpdate = true })
}

// Field registers a field that can be set in the upsert to value T. If T is
// a zero value, the field is not set on an update, UNLESS the `forceUpdate`
// parameter was provided as `true` to upsert.New(...).
func Field[T comparable](b *Builder, column constString, value T, opts ...FieldOption) {
	opt := fieldOptions{}
	for _, o := range opts {
		o.apply(&opt)
	}
	var zero T

	// If upsert has a zero value, and we would prefer to use the column default,
	// do nothing, unless we are performing a force-update across all fields.
	if !b.forceUpdate && (zero == value && opt.useColumnDefault) {
		return
	}

	// If we are force-updating, and the field is marked to be ignored, do nothing.
	if b.forceUpdate && opt.ignoreOnForceUpdate {
		return
	}

	b.insertColumns = append(b.insertColumns, string(column))
	b.args[string(column)] = value

	// If we are force-updating, or value is not zero, update the column in
	// existing rows (on conflict).
	if b.forceUpdate || value != zero {
		b.updateColumns = append(b.updateColumns, string(column))
	}
}

func (b *Builder) buildQuery() (string, bool) {
	if len(b.updateColumns) == 0 {
		return "", false
	}

	onConflictSets := make([]string, len(b.updateColumns))
	for i, c := range b.updateColumns {
		onConflictSets[i] = fmt.Sprintf("%[1]s = EXCLUDED.%[1]s", c)
	}

	insertArgNames := make([]string, len(b.insertColumns))
	for i, c := range b.insertColumns {
		insertArgNames[i] = fmt.Sprintf("@%s", c)
	}

	return fmt.Sprintf(`
INSERT INTO %[1]s
	(%[2]s)
VALUES
	(%[3]s)
ON CONFLICT
	(%[4]s)
DO UPDATE SET
	%[5]s`,
		b.table,                             // %[1]s
		strings.Join(b.insertColumns, ", "), // %[2]s
		strings.Join(insertArgNames, ", "),  // %[3]s
		b.primaryKey,                        // %[4]s
		strings.Join(onConflictSets, ",\n"), // %[5]s
	), true
}

func (b *Builder) Exec(ctx context.Context, db *pgxpool.Pool) error {
	q, ok := b.buildQuery()
	if !ok {
		return nil
	}
	if _, err := db.Exec(ctx, q, b.args); err != nil {
		return err
	}
	return nil
}
