/**
 * Microsoft Graph Subscription DTO
 * Data Transfer Object for Microsoft Graph API subscriptions
 */
export interface MicrosoftSubscriptionDTO {
    id: string;
    resource: string;
    applicationId: string;
    changeType: string;
    clientState?: string;
    notificationUrl: string;
    expirationDateTime: string;
    creatorId?: string;
}

/**
 * Microsoft Graph Notification DTO
 * Data received from Microsoft Graph webhooks
 */
export interface MicrosoftNotificationDTO {
    subscriptionId: string;
    subscriptionExpirationDateTime: string;
    changeType: string;
    resource: string;
    resourceData: {
        id: string;
        '@odata.type': string;
        '@odata.id': string;
    };
    clientState?: string;
    tenantId: string;
}

/**
 * Microsoft Graph Webhook Validation Request
 */
export interface MicrosoftWebhookValidationDTO {
    validationToken: string;
}