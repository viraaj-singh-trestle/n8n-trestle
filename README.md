# n8n-nodes-trestle

This is an n8n community node. It lets you use Trestle in your n8n workflows.

Trestle provides a Phone Validation API to validate phone numbers and retrieve valuable metadata.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

* **Phone Validation** - Validates a phone number and returns metadata

## Credentials

To use this node, you need a Trestle API key. 

1. Sign up for a Trestle account at [trestleiq.com](https://trestleiq.com)
2. Generate your API key from the Trestle dashboard
3. In n8n, create a new credential of type "Trestle API"
4. Enter your API key in the credential configuration

## Compatibility

This node is compatible with n8n version 1.0.0 and above.

## Usage

To use the Trestle node:

1. Add the Trestle node to your workflow
2. Configure your Trestle API credentials
3. Enter a phone number in E.164 format (e.g., +1234567890) or local format
4. Optionally, provide a country hint using the ISO-3166 alpha-2 country code (e.g., US)
5. Execute the node to validate the phone number and retrieve metadata

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Trestle Phone Validation API documentation](https://trestle-api.redoc.ly/Current/tag/Phone-Validation-API)
