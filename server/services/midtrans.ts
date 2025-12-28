import midtransClient from 'midtrans-client';
import type { H3Event } from 'h3';

let snap: any = null;
let core: any = null;

const getSnap = () => {
    if (snap) return snap;

    const config = useRuntimeConfig();
    snap = new midtransClient.Snap({
        isProduction: config.midtransIsProduction,
        serverKey: config.midtransServerKey,
        clientKey: config.midtransClientKey
    });
    return snap;
};

const getCore = () => {
    if (core) return core;

    const config = useRuntimeConfig();
    core = new midtransClient.CoreApi({
        isProduction: config.midtransIsProduction,
        serverKey: config.midtransServerKey,
        clientKey: config.midtransClientKey
    });
    return core;
}

export type TransactionDetails = {
    order_id: string;
    gross_amount: number;
};

export type CustomerDetails = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    billing_address?: any;
    shipping_address?: any;
};

export type ItemDetails = {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
};

export type TransactionParams = {
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    customer_details?: CustomerDetails;
    credit_card?: {
        secure: boolean;
    };
    callbacks?: {
        finish?: string;
    };
    expiry?: {
        unit: string;
        duration: number;
    }
};

/**
 * Create a Snap transaction and return the token and redirect URL
 */
export const createSnapTransaction = async (params: TransactionParams) => {
    try {
        const snap = getSnap();
        const transaction = await snap.createTransaction(params);
        return transaction;
    } catch (error) {
        console.error('Midtrans Snap Error:', error);
        throw error;
    }
};

/**
 * Verify a notification from Midtrans
 */
export const verifyNotification = async (notificationBody: any) => {
    try {
        const core = getCore();
        const statusResponse = await core.transaction.notification(notificationBody);
        return statusResponse;
    } catch (error) {
        console.error('Midtrans Notification Verification Error:', error);
        throw error;
    }
};

export default {
    createSnapTransaction,
    verifyNotification
};
