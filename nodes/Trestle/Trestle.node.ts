import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Trestle implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Trestle',
		name: 'trestle',
		icon: 'file:trestle.svg',
		group: ['transform'],
		version: 1,
		description: 'Validate phone numbers using the Trestle Phone Validation API.',
		defaults: {
			name: 'Trestle',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'trestleApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Phone Validation',
						value: 'phoneValidation',
					},
				],
				default: 'phoneValidation',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['phoneValidation'],
					},
				},
				options: [
					{
						name: 'Validate a Phone Number',
						value: 'validate',
						description: 'Validates a phone number and returns metadata',
						action: 'Validate a phone number',
					},
				],
				default: 'validate',
			},
			{
				displayName: 'Phone Number',
				name: 'phone',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['phoneValidation'],
						operation: ['validate'],
					},
				},
				default: '',
				description: 'The phone number to validate in E.164 or local format',
			},
			{
				displayName: 'Country Hint',
				name: 'countryHint',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['phoneValidation'],
						operation: ['validate'],
					},
				},
				default: '',
				description: 'The ISO-3166 alpha-2 country code of the phone number (e.g., US)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			if (resource === 'phoneValidation' && operation === 'validate') {
				const phone = this.getNodeParameter('phone', i) as string;
				const countryHint = this.getNodeParameter('countryHint', i) as string;

				const credentials = await this.getCredentials('trestleApi');

				let queryString = `phone=${encodeURIComponent(phone)}`;
				if (countryHint) {
					queryString += `&phone.country_hint=${encodeURIComponent(countryHint)}`;
				}

				const options = {
					method: 'GET' as const,
					url: `https://api.trestleiq.com/3.0/phone_intel?${queryString}`,
					headers: {
						'x-api-key': credentials.apiKey as string,
					},
				};

				try {
					const response = await this.helpers.request(options);
					returnData.push({
						json: typeof response === 'string' ? JSON.parse(response) : response,
					});
				} catch (error) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
							},
							error,
							pairedItem: i,
						});
					} else {
						if (error.context) {
							error.context.itemIndex = i;
							throw error;
						}
						throw new NodeOperationError(this.getNode(), error, {
							itemIndex: i,
						});
					}
				}
			}
		}

		return [returnData];
	}
}