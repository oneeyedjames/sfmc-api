import { ApiObjectFactory } from './api';
import { ObjectApi } from './object';

/**
 * Represents data in synchronized data extensions.
 *
 * Contact and Subscription objects are synced from Salesforce every 15 minutes.
 */
export class DataExtApi extends ObjectApi {
	static readonly SalesforceProps = [
		'Id'
	];

	static readonly ContactType = 'Contact_Salesforce';

	static readonly ContactProps = [
		...DataExtApi.SalesforceProps,
		'Legacy_Id__c',
		'Customer_Number__c',
		'BusinessLocation__c',
		'Name',
		'Email',
		'Country__c',
		'Contact_Status__c',
		'Time_Zone__c'
	];

	static readonly ContactPropMap = {
		Contact_Status__c: 'Status'
	};

	static readonly SubscriptionType = 'Subscription__c_Salesforce';

	static readonly SubscriptionProps = [
		...DataExtApi.SalesforceProps,
		'Business_Location__c',
		'Line_of_Business__c',
		'Contact__c',
		'Global_Product__c',
		'Global_Product_Code__c',
		'Status__c',
		'Inactive_Reason__c',
		'Welcome_Status__c'
	];

	static readonly SubscriptionPropMap = {
		Contact__c: 'ContactId',
		Global_Product__c: 'GlobalProductId',
		Line_of_Business__c: 'LineOfBusiness'
	};

	constructor(
		factory: ApiObjectFactory,
		protected extName: string,
		props: string[] = [],
		protected propMap: { [prop: string]: string } = {}
	) {
		super(factory, props);
	}

	async get(value?: string | string[], field = 'Id', extra?: string) {
		const rows = await super.get(value, field, extra);

		return rows.map(row => {
			const data = {} as { [key: string]: any };

			row.Properties.Property.forEach((prop: any) => {
				let key = (this.propMap[prop.Name] || prop.Name) as string;
				key = key.replace(/__c$/, '').replace('_', '').replace('_', '');
				data[key] = prop.Value;
			});

			return data as any;
		});
	}

	protected getConfig(value?: string | string[], field = 'Id', extra?: string) {
		const config = super.getConfig(value, field, extra) as any;
		config.Name = this.extName;
		return config;
	}
}
