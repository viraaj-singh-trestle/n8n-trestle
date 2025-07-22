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
		version: 2,
		description: 'Validate phone numbers, emails, and contacts using Trestle APIs.',
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
						description: 'Validate phone numbers and get activity scores',
					},
					{
						name: 'Real Contact',
						value: 'realContact',
						description: 'Comprehensive contact verification and grading',
					},
				],
				default: 'phoneValidation',
			},
			// Phone Validation Operations
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
						name: 'Validate Phone Number',
						value: 'validate',
						description: 'Validates phone numbers from input data',
						action: 'Validate phone numbers',
					},
				],
				default: 'validate',
			},
			// Real Contact Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				options: [
					{
						name: 'Verify Contact',
						value: 'verify',
						description: 'Verify and grade phone, email, and address information',
						action: 'Verify contact information',
					},
				],
				default: 'verify',
			},
			// Phone Validation Fields
			{
				displayName: 'Phone Numbers Field',
				name: 'phoneField',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['phoneValidation'],
					},
				},
				default: 'phone',
				description: 'Field name containing phone numbers in input data',
			},
			{
				displayName: 'Country Hint',
				name: 'countryHint',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['phoneValidation'],
					},
				},
				default: '',
				description: 'The ISO-3166 alpha-2 country code of the phone number (e.g., US)',
			},
			// Real Contact Fields
			{
				displayName: 'Name Field',
				name: 'nameField',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'name',
				description: 'Field name containing contact names in input data',
			},
			{
				displayName: 'Phone Number Field',
				name: 'phoneField',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'phone',
				description: 'Field name containing phone numbers in input data',
			},
			{
				displayName: 'Email Field',
				name: 'emailField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'email',
				description: 'Field name containing email addresses in input data (optional)',
			},
			{
				displayName: 'IP Address Field',
				name: 'ipAddressField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'ip',
				description: 'Field name containing IP addresses in input data (optional)',
			},
			{
				displayName: 'Address Field',
				name: 'addressField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'address',
				description: 'Field name containing street addresses in input data (optional)',
			},
			{
				displayName: 'City Field',
				name: 'cityField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'city',
				description: 'Field name containing city names in input data (optional)',
			},
			{
				displayName: 'State Field',
				name: 'stateField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'state',
				description: 'Field name containing state codes in input data (optional)',
			},
			{
				displayName: 'Postal Code Field',
				name: 'postalCodeField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: 'postal_code',
				description: 'Field name containing postal codes in input data (optional)',
			},
			{
				displayName: 'Include Email Deliverability',
				name: 'includeEmailDeliverability',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['realContact'],
					},
				},
				default: false,
				description: 'Whether to include email deliverability checks (additional cost)',
			},
			{
				displayName: 'Include Litigator Check',
				name: 'includeLitigatorCheck',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['phoneValidation', 'realContact'],
					},
				},
				default: false,
				description: 'Whether to include litigator checks (additional cost)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('trestleApi');

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i);
			const operation = this.getNodeParameter('operation', i);

			try {
				if (resource === 'phoneValidation' && operation === 'validate') {
					const phoneField = this.getNodeParameter('phoneField', i) as string;
					const phone = items[i].json[phoneField] as string;
					
					if (!phone) {
						throw new NodeOperationError(this.getNode(), `Phone number not found in field '${phoneField}'`, {
							itemIndex: i,
						});
					}

					// Phone Validation API call
					const countryHint = this.getNodeParameter('countryHint', i) as string;
					const includeLitigatorCheck = this.getNodeParameter('includeLitigatorCheck', i) as boolean;

					let queryString = `phone=${encodeURIComponent(phone)}`;
					if (countryHint) {
						queryString += `&phone.country_hint=${encodeURIComponent(countryHint)}`;
					}
					if (includeLitigatorCheck) {
						queryString += `&addons=litigator_check`;
					}

					const phoneOptions = {
						method: 'GET' as const,
						url: `https://api.trestleiq.com/3.0/phone_intel?${queryString}`,
						headers: {
							'x-api-key': credentials.apiKey as string,
						},
					};


					const phoneResponse = await this.helpers.request(phoneOptions);
					const phoneApiResponse = typeof phoneResponse === 'string' ? JSON.parse(phoneResponse) : phoneResponse;

					returnData.push({
						json: phoneApiResponse,
						pairedItem: i,
					});

				} else if (resource === 'realContact' && operation === 'verify') {
					// Real Contact API call - get data from input fields
					const nameField = this.getNodeParameter('nameField', i) as string;
					const phoneField = this.getNodeParameter('phoneField', i) as string;
					const emailField = this.getNodeParameter('emailField', i) as string;
					const ipAddressField = this.getNodeParameter('ipAddressField', i) as string;
					const addressField = this.getNodeParameter('addressField', i) as string;
					const cityField = this.getNodeParameter('cityField', i) as string;
					const stateField = this.getNodeParameter('stateField', i) as string;
					const postalCodeField = this.getNodeParameter('postalCodeField', i) as string;
					const includeEmailDeliverability = this.getNodeParameter('includeEmailDeliverability', i) as boolean;
					const includeLitigatorCheck = this.getNodeParameter('includeLitigatorCheck', i) as boolean;

					const name = items[i].json[nameField] as string;
					const phone = items[i].json[phoneField] as string;

					if (!name || !phone) {
						throw new NodeOperationError(this.getNode(), `Required fields not found: name in '${nameField}' or phone in '${phoneField}'`, {
							itemIndex: i,
						});
					}

					// Build query parameters for GET request
					let queryString = `name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;

					const email = items[i].json[emailField] as string;
					const ipAddress = items[i].json[ipAddressField] as string;
					const address = items[i].json[addressField] as string;
					const city = items[i].json[cityField] as string;
					const state = items[i].json[stateField] as string;
					const postalCode = items[i].json[postalCodeField] as string;

					if (email) queryString += `&email=${encodeURIComponent(email)}`;
					if (ipAddress) queryString += `&ip_address=${encodeURIComponent(ipAddress)}`;
					if (address) queryString += `&address.street_line_1=${encodeURIComponent(address)}`;
					if (city) queryString += `&address.city=${encodeURIComponent(city)}`;
					if (state) queryString += `&address.state_code=${encodeURIComponent(state)}`;
					if (postalCode) queryString += `&address.postal_code=${encodeURIComponent(postalCode)}`;

					const addons = [];
					if (includeEmailDeliverability) addons.push('email_checks_deliverability');
					if (includeLitigatorCheck) addons.push('litigator_checks');
					if (addons.length > 0) queryString += `&add_ons=${encodeURIComponent(addons.join(','))}`;

					const contactOptions = {
						method: 'GET' as const,
						url: `https://api.trestleiq.com/1.1/real_contact?${queryString}`,
						headers: {
							'x-api-key': credentials.apiKey as string,
						},
					};


					const contactResponse = await this.helpers.request(contactOptions);
					const contactApiResponse = typeof contactResponse === 'string' ? JSON.parse(contactResponse) : contactResponse;

					returnData.push({
						json: contactApiResponse,
						pairedItem: i,
					});
				}
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

		return [returnData];
	}


}
