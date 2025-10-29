// Seed data for revenues page
export interface Customer {
    id: string;
    name: string;
    email: string;
    type: 'enterprise' | 'smb' | 'individual';
    country: string;
}

export interface Project {
    id: string;
    name: string;
    customer_id: string;
    status: 'active' | 'completed' | 'on_hold';
    budget: number;
    start_date: string;
}

export interface Product {
    id: string;
    code: string;
    name: string;
    category: string;
    price: number;
}

export interface Revenue {
    id: string;
    date: string;
    amount: number;
    currency: string;
    invoice_id: string;
    status: 'paid' | 'unpaid' | 'overdue' | 'void';
    due_date: string;
    project_id: string;
    product_code: string;
    customer_id: string;
    channel: 'CRM' | 'POS' | 'ECOM' | 'MANUAL';
    fx_rate: number;
}

// Generate demo customers
export const customers: Customer[] = [
    { id: '1', name: 'Acme Corp', email: 'billing@acme.com', type: 'enterprise', country: 'US' },
    { id: '2', name: 'TechStart Inc', email: 'finance@techstart.com', type: 'smb', country: 'US' },
    { id: '3', name: 'Global Solutions', email: 'accounts@global.com', type: 'enterprise', country: 'UK' },
    { id: '4', name: 'Local Business', email: 'owner@local.com', type: 'smb', country: 'US' },
    { id: '5', name: 'Innovation Labs', email: 'billing@innovation.com', type: 'enterprise', country: 'CA' },
    { id: '6', name: 'Startup Hub', email: 'finance@startup.com', type: 'smb', country: 'US' },
    { id: '7', name: 'Enterprise Plus', email: 'ap@enterprise.com', type: 'enterprise', country: 'DE' },
    { id: '8', name: 'Small Co', email: 'billing@small.com', type: 'individual', country: 'US' },
];

// Generate demo projects
export const projects: Project[] = [
    { id: '1', name: 'Website Redesign', customer_id: '1', status: 'active', budget: 50000, start_date: '2024-01-15' },
    { id: '2', name: 'Mobile App', customer_id: '2', status: 'active', budget: 75000, start_date: '2024-02-01' },
    { id: '3', name: 'Data Migration', customer_id: '3', status: 'completed', budget: 120000, start_date: '2023-11-01' },
    { id: '4', name: 'CRM Integration', customer_id: '4', status: 'active', budget: 25000, start_date: '2024-03-01' },
    { id: '5', name: 'Cloud Migration', customer_id: '5', status: 'active', budget: 200000, start_date: '2024-01-01' },
    { id: '6', name: 'Security Audit', customer_id: '6', status: 'completed', budget: 15000, start_date: '2024-02-15' },
    { id: '7', name: 'ERP Implementation', customer_id: '7', status: 'active', budget: 300000, start_date: '2023-12-01' },
    { id: '8', name: 'Consulting', customer_id: '8', status: 'on_hold', budget: 10000, start_date: '2024-03-15' },
];

// Generate demo products
export const products: Product[] = [
    { id: '1', code: 'CONS-001', name: 'Strategy Consulting', category: 'Consulting', price: 200 },
    { id: '2', code: 'DEV-001', name: 'Web Development', category: 'Development', price: 150 },
    { id: '3', code: 'DEV-002', name: 'Mobile Development', category: 'Development', price: 175 },
    { id: '4', code: 'INFRA-001', name: 'Cloud Infrastructure', category: 'Infrastructure', price: 100 },
    { id: '5', code: 'SEC-001', name: 'Security Assessment', category: 'Security', price: 250 },
    { id: '6', code: 'DATA-001', name: 'Data Analytics', category: 'Analytics', price: 180 },
    { id: '7', code: 'TRAIN-001', name: 'Training Services', category: 'Training', price: 120 },
    { id: '8', code: 'SUPP-001', name: 'Technical Support', category: 'Support', price: 80 },
];

// Generate demo revenue data
const generateRevenues = (): Revenue[] => {
    const revenues: Revenue[] = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2025-01-31');

    let invoiceCounter = 1000;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Skip some days randomly
        if (Math.random() < 0.3) continue;

        // Generate 1-5 revenue entries per day
        const entriesPerDay = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < entriesPerDay; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const project = projects.find(p => p.customer_id === customer.id) || projects[0];
            const product = products[Math.floor(Math.random() * products.length)];

            // Generate amount based on product and some randomness
            const baseAmount = product.price * (Math.random() * 20 + 5); // 5-25 hours
            const amount = Math.round(baseAmount * (0.8 + Math.random() * 0.4)); // ±20% variation

            // Currency based on customer country
            let currency = 'USD';
            let fx_rate = 1;
            if (customer.country === 'UK') {
                currency = 'GBP';
                fx_rate = 1.25;
            } else if (customer.country === 'DE') {
                currency = 'EUR';
                fx_rate = 1.1;
            } else if (customer.country === 'CA') {
                currency = 'CAD';
                fx_rate = 0.75;
            }

            // Status logic
            let status: Revenue['status'] = 'paid';
            const daysSinceInvoice = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceInvoice < 30) {
                const rand = Math.random();
                if (rand < 0.1) status = 'unpaid';
                else if (rand < 0.15) status = 'overdue';
                else if (rand < 0.02) status = 'void';
            }

            // Due date (typically 30 days from invoice date)
            const dueDate = new Date(d);
            dueDate.setDate(dueDate.getDate() + 30);

            // Channel distribution
            const channels: Revenue['channel'][] = ['CRM', 'POS', 'ECOM', 'MANUAL'];
            const channelWeights = [0.4, 0.2, 0.3, 0.1];
            let channel: Revenue['channel'] = 'CRM';
            const rand = Math.random();
            let cumWeight = 0;
            for (let j = 0; j < channels.length; j++) {
                cumWeight += channelWeights[j];
                if (rand < cumWeight) {
                    channel = channels[j];
                    break;
                }
            }

            revenues.push({
                id: `rev-${revenues.length + 1}`,
                date: d.toISOString().split('T')[0],
                amount,
                currency,
                invoice_id: `INV-${invoiceCounter++}`,
                status,
                due_date: dueDate.toISOString().split('T')[0],
                project_id: project.id,
                product_code: product.code,
                customer_id: customer.id,
                channel,
                fx_rate
            });
        }
    }

    return revenues;
};

export const revenues: Revenue[] = generateRevenues();
