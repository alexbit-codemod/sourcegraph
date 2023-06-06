package lsifstore

import (
	"bytes"
	"context"

	"github.com/keegancsmith/sqlf"
	"github.com/lib/pq"
	"github.com/sourcegraph/scip/bindings/go/scip"
	"go.opentelemetry.io/otel/attribute"
	"google.golang.org/protobuf/proto"

	"github.com/sourcegraph/sourcegraph/enterprise/internal/codeintel/shared/symbols"
	"github.com/sourcegraph/sourcegraph/enterprise/internal/codeintel/uploads/shared"
	"github.com/sourcegraph/sourcegraph/internal/database/basestore"
	"github.com/sourcegraph/sourcegraph/internal/database/dbutil"
	"github.com/sourcegraph/sourcegraph/internal/observation"
)

func (s *store) SCIPDocument(ctx context.Context, id int, path string) (_ *scip.Document, err error) {
	ctx, _, endObservation := s.operations.scipDocument.With(ctx, &err, observation.Args{Attrs: []attribute.KeyValue{
		attribute.String("path", path),
		attribute.Int("uploadID", id),
	}})
	defer endObservation(1, observation.Args{})

	scanner := basestore.NewFirstScanner(func(dbs dbutil.Scanner) (*scip.Document, error) {
		var compressedSCIPPayload []byte
		if err := dbs.Scan(&compressedSCIPPayload); err != nil {
			return nil, err
		}

		scipPayload, err := shared.Decompressor.Decompress(bytes.NewReader(compressedSCIPPayload))
		if err != nil {
			return nil, err
		}

		var document scip.Document
		if err := proto.Unmarshal(scipPayload, &document); err != nil {
			return nil, err
		}
		return &document, nil
	})
	doc, _, err := scanner(s.db.Query(ctx, sqlf.Sprintf(fetchSCIPDocumentQuery, id, path)))
	return doc, err
}

const fetchSCIPDocumentQuery = `
SELECT sd.raw_scip_payload
FROM codeintel_scip_document_lookup sid
JOIN codeintel_scip_documents sd ON sd.id = sid.document_id
WHERE
	sid.upload_id = %s AND
	sid.document_path = %s
`

func (s *store) GetSCIPDocumentsBySymbolNames(ctx context.Context, uploadID int, symbolNames []string) (documents []*scip.Document, err error) {
	ctx, _, endObservation := s.operations.getSCIPDocumentsBySymbolNames.With(ctx, &err, observation.Args{Attrs: []attribute.KeyValue{
		attribute.Int("uploadID", uploadID),
	}})
	defer endObservation(1, observation.Args{})

	q := sqlf.Sprintf(
		getDocumentsBySymbolNameQuery,
		pq.Array(formatSymbolNamesToLikeClause(symbolNames)),
		uploadID,
	)

	rows, err := s.db.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer func() { err = basestore.CloseRows(rows, err) }()

	for rows.Next() {
		var b []byte
		var documentPath string
		if err := rows.Scan(&b, &documentPath); err != nil {
			return nil, err
		}

		d, err := shared.Decompressor.Decompress(bytes.NewReader(b))
		if err != nil {
			return nil, err
		}

		var doc scip.Document
		if err := proto.Unmarshal(d, &doc); err != nil {
			return nil, err
		}
		doc.RelativePath = documentPath

		documents = append(documents, &doc)
	}

	return documents, err
}

const getDocumentsBySymbolNameQuery = `
SELECT
    sd.raw_scip_payload,
	sdl.document_path
FROM codeintel_scip_symbols_lookup ssl
JOIN codeintel_scip_symbols ss ON ss.upload_id = ssl.upload_id AND ss.descriptor_id = ssl.id
JOIN codeintel_scip_document_lookup sdl ON sdl.id = ss.document_lookup_id
JOIN codeintel_scip_documents sd ON sd.id = sdl.document_id
WHERE
    ssl.name ILIKE ANY(%s)
    AND ssl.scip_name_type = 'DESCRIPTOR'
    AND ssl.upload_id = %s;
`

func formatSymbolNamesToLikeClause(symbolNames []string) []string {
	explodedSymbols := make([]string, 0, len(symbolNames))
	for _, symbolName := range symbolNames {
		ex := symbols.NewExplodedSymbol(symbolName)
		explodedSymbols = append(
			explodedSymbols,
			"%"+ex.Descriptor+"%",
		)
	}

	return explodedSymbols
}
