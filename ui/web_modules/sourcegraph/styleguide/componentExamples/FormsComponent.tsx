import * as React from "react";
import { Code, Heading, Input, Panel, Select, Table } from "sourcegraph/components";
import * as base from "sourcegraph/components/styles/_base.css";
import { whitespace } from "sourcegraph/components/utils";

interface State {
	activeExample: number;
}

export class FormsComponent extends React.Component<{}, State> {
	state: State = {
		activeExample: 0,
	};

	render(): JSX.Element | null {
		return (

			<div className={base.mv4}>
				<Heading level={3} className={base.mb2}>Forms</Heading>

				<Panel hoverLevel="low">

					<div className={base.pa4}>

						<Input placeholder="Placeholder text" block={true} label="Input label" helperText="This is optional helper text." className={base.mb4} />
						<Select defaultValue="" label="Select label" containerStyle={{ marginBottom: whitespace[4] }}>
							<option value="" disabled={true}>Placeholder</option>
							<option>Option 1</option>
							<option>Option 2</option>
							<option>Option 3</option>
						</Select>

						<Input placeholder="Placeholder text" block={true} error={true} label="Input label" className={base.mb4} />

						<Input placeholder="Placeholder text" block={true} icon="User" iconPosition="right" label="Small input" compact={true} className={base.mb4} />

						<Input placeholder="Placeholder text" block={true} icon="Search" iconPosition="right" error={true} optionalText="This" label="Input label" errorText="This is an error." className={base.mb4} />

						<Select label="Select label" containerStyle={{ marginBottom: whitespace[4] }} placeholder="Select an option">
							<option>Option 1</option>
							<option>Option 2</option>
							<option>Option 3</option>
						</Select>

						<Select error={true} label="Select label" errorText="This is an error" placeholder="Select an option" containerStyle={{ marginBottom: whitespace[4] }}>
							<option>Option 1</option>
							<option>Option 2</option>
							<option>Option 3</option>
						</Select>

					</div>
					<hr />
					<code>
						<pre className={base.ph4} style={{ whiteSpace: "pre-wrap" }}>
							{
								`
<Input placeholder="Placeholder text" block={true} label="Input label" helperText="This is optional helper text." className={base.mb4} />
<Select defaultValue="" label="Select label">
	<option value="" disabled={true}>Placeholder</option>
	<option>Option 1</option>
	<option>Option 2</option>
	<option>Option 3</option>
</Select>

<Input placeholder="Placeholder text" block={true} error={true} label="Input label" className={base.mb4} />

<Input placeholder="Placeholder text" block={true} error={true} label="Input label" errorText="This is an error." className={base.mb4} />

<Select defaultValue="" error={true} label="Select label" className={base.mb4}>
	<option value="" disabled={true}>Placeholder</option>
	<option>Option 1</option>
	<option>Option 2</option>
	<option>Option 3</option>
</Select>

<Select defaultValue="" error={true} label="Select label" errorText="This is an error" className={base.mb4}>
	<option value="" disabled={true}>Placeholder</option>
	<option>Option 1</option>
	<option>Option 2</option>
	<option>Option 3</option>
</Select>

`
							}
						</pre>
					</code>
				</Panel>
				<Heading level={6} style={{ marginTop: whitespace[4], marginBottom: whitespace[3] }}>Properties</Heading>
				<Panel hoverLevel="low" className={base.pa4}>
					<Table style={{ width: "100%" }}>
						<thead>
							<tr>
								<td>Prop</td>
								<td>Default value</td>
								<td>Values</td>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><Code>color</Code></td>
								<td><Code>green</Code></td>
								<td>
									<Code>green</Code>, <Code>purple</Code>, <Code>blue</Code>, <Code>orange</Code>
								</td>
							</tr>
							<tr>
								<td><Code>steps</Code></td>
								<td><Code>[null, null, null]</Code></td>
								<td>
									An <Code>array</Code> of <Code>null</Code> or <Code>string</Code> values
								</td>
							</tr>
							<tr>
								<td><Code>stepsComplete</Code></td>
								<td><Code>0</Code></td>
								<td>
									Any positive integer that is less than or equal to length of array passed to the <Code>steps</Code> prop
								</td>
							</tr>
						</tbody>
					</Table>
				</Panel>
			</div>
		);
	}
}
