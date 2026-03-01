import { useStore, Order } from '@/lib/store';

export const handlePrintKOT = (order: any, autoPrint = false) => {
    const printWindow = window.open('', '_blank', 'width=500,height=800');
    if (!printWindow) return;

    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>KOT #${order.id.slice(0, 6)}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Arial', 'Helvetica', sans-serif; 
                    background: #f5f5f5;
                    color: #000;
                    font-size: 16px;
                    line-height: 1.6;
                    padding: 0;
                    margin: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    min-height: 100vh;
                    padding: 0;
                }
                .content {
                    padding: 20px;
                    padding-bottom: 100px; /* Space for fixed buttons */
                }
                .header { 
                    text-align: center; 
                    background: #ff6b00;
                    color: white;
                    padding: 20px; 
                    margin-bottom: 20px;
                }
                .header h2 { 
                    font-size: 16px; 
                    font-weight: 600;
                    margin-bottom: 8px;
                    letter-spacing: 2px;
                }
                .header h1 { 
                    font-size: 32px; 
                    font-weight: 900;
                    margin: 0;
                }
                .meta { 
                    font-size: 18px; 
                    margin-bottom: 25px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                }
                .meta-row { 
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #dee2e6;
                }
                .meta-row:last-child {
                    border-bottom: none;
                }
                .meta-label { 
                    font-weight: 700; 
                    color: #495057;
                }
                .meta-value {
                    font-weight: 600;
                    color: #212529;
                }
                .section-title {
                    font-size: 20px;
                    font-weight: 800;
                    margin: 25px 0 15px;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #ff6b00;
                    color: #212529;
                }
                .items { 
                    margin: 20px 0;
                }
                .item { 
                    display: flex; 
                    align-items: center;
                    padding: 15px; 
                    margin-bottom: 10px;
                    background: #fff;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    font-size: 18px;
                }
                .item-qty { 
                    background: #ff6b00;
                    color: white;
                    font-size: 22px; 
                    font-weight: 900; 
                    min-width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    margin-right: 15px;
                    flex-shrink: 0;
                }
                .item-name {
                    font-size: 20px;
                    font-weight: 600;
                    color: #212529;
                    flex: 1;
                }
                .summary { 
                    margin-top: 30px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #ff6b00;
                    text-align: center;
                }
                .summary-item {
                    font-size: 18px;
                    font-weight: 700;
                    padding: 8px 0;
                    color: #495057;
                }
                .button-container {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 15px;
                    box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
                    display: flex;
                    gap: 10px;
                    max-width: 500px;
                    margin: 0 auto;
                    z-index: 1000;
                }
                .btn {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-print {
                    background: #ff6b00;
                    color: white;
                }
                .btn-close {
                    background: #6c757d;
                    color: white;
                }
                .btn:active {
                    transform: scale(0.98);
                }

                @media print {
                    body { background: white; }
                    .button-container { display: none; }
                    .content { padding-bottom: 20px; }
                    .container { background: white; }
                }

                @media (max-width: 480px) {
                    .header h1 { font-size: 28px; }
                    .item { font-size: 16px; }
                    .item-name { font-size: 18px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="header">
                        <h2>KITCHEN ORDER TICKET</h2>
                        <h1>KOT #${order.id.slice(0, 6)}</h1>
                    </div>
                    
                    <div class="meta">
                        <div class="meta-row">
                            <span class="meta-label">TABLE:</span>
                            <span class="meta-value">${tableName}</span>
                        </div>
                        ${order.customerName ? `
                        <div class="meta-row">
                            <span class="meta-label">CUSTOMER:</span>
                            <span class="meta-value">${order.customerName}</span>
                        </div>` : ''}
                        ${order.customerPhone ? `
                        <div class="meta-row">
                            <span class="meta-label">PHONE:</span>
                            <span class="meta-value">${order.customerPhone}</span>
                        </div>` : ''}
                        <div class="meta-row">
                            <span class="meta-label">TIME:</span>
                            <span class="meta-value">${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">DATE:</span>
                            <span class="meta-value">${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                    
                    <h3 class="section-title">🍽️ ORDER ITEMS</h3>
                    <div class="items">
                        ${order.items.map((item: any) => `
                            <div class="item">
                                <div class="item-qty">${item.quantity}x</div><div class="item-name">${item.name}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="summary">
                        <div class="summary-item">Total Items: ${order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</div>
                        <div class="summary-item" style="color: #212529; font-size: 16px; margin-top: 10px;">
                            Printed: ${new Date().toLocaleTimeString('en-IN')}
                        </div>
                    </div>
                </div>

                <div class="button-container">
                    <button class="btn btn-print" onclick="window.print()">
                        🖨️ PRINT KOT
                    </button>
                    <button class="btn btn-close" onclick="window.close()">
                        ✖️ CLOSE
                    </button>
                </div>
            </div>
        </body>
    </html>
    `);

    if (autoPrint) {
        printWindow.document.write(`
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        `);
    }
    printWindow.document.close();
};

export const handlePrintBill = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=500,height=900');
    if (!printWindow) return;

    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';
    const contactInfo = useStore.getState().contactInfo;

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Bill #${order.id.slice(0, 6)}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Arial', 'Helvetica', sans-serif; 
                    background: #f5f5f5;
                    color: #000;
                    font-size: 16px;
                    padding: 0;
                    margin: 0;
                }
                /* ... rest of the CSS from handlePrintBill ... */
                .container { max-width: 500px; margin: 0 auto; background: white; min-height: 100vh; padding: 0; }
                .content { padding: 20px; padding-bottom: 100px; }
                .header { text-align: center; background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%); color: white; padding: 25px 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 5px; letter-spacing: 1px; }
                .bill-tag { background: white; color: #DAA520; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 800; margin-top: 12px; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .bill-info { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid #e9ecef; }
                .bill-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #dee2e6; }
                .section-title { font-size: 20px; font-weight: 800; margin: 25px 0 15px; padding-bottom: 10px; border-bottom: 3px solid #DAA520; color: #212529; }
                .items table { width: 100%; border-collapse: collapse; }
                .items th { background: #DAA520; color: white; padding: 12px 8px; text-align: left; font-size: 14px; }
                .items td { padding: 12px 8px; border-bottom: 1px solid #e9ecef; font-size: 15px; }
                .total-section { margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid #DAA520; }
                .total-row.grand { font-size: 24px; font-weight: 900; margin-top: 12px; padding-top: 12px; border-top: 2px dashed #DAA520; color: #DAA520; }
                .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 12px; }
                .button-container { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 15px; box-shadow: 0 -4px 10px rgba(0,0,0,0.1); display: flex; gap: 10px; max-width: 500px; margin: 0 auto; }
                .btn { flex: 1; padding: 16px; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; }
                .btn-print { background: #DAA520; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="header">
                        <h1>TashiZom</h1>
                        <div class="subtitle">Multi-Cuisine Restaurant</div>
                        <div class="bill-tag">BILL #${order.id.slice(0, 6)}</div>
                    </div>
                    <div class="bill-info">
                        <div class="bill-info-row"><strong>Table:</strong><span>${tableName}</span></div>
                        <div class="bill-info-row"><strong>Date:</strong><span>${new Date(order.createdAt).toLocaleDateString('en-IN')}</span></div>
                    </div>
                    <h3 class="section-title">📋 ORDER DETAILS</h3>
                    <div class="items">
                        <table>
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
                            <tbody>
                                ${order.items.map((item: any) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.price}</td>
                                        <td>₹${item.price * item.quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="total-section">
                        <div class="total-row grand"><span>TOTAL:</span><span>₹${order.totalAmount}</span></div>
                    </div>
                    <div class="footer"><p>🙏 Thank you for dining with us!</p></div>
                </div>
                <div class="button-container">
                    <button class="btn btn-print" onclick="window.print()">🖨️ PRINT BILL</button>
                    <button class="btn" onclick="window.close()">✖️ CLOSE</button>
                </div>
            </div>
        </body>
    </html>
    `);
    printWindow.document.close();
};

export const handleShareKOT = async (order: Order) => {
    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    const kotText = `🍴 KITCHEN ORDER TICKET (KOT)
KOT #${order.id.slice(0, 6)}

📍 TABLE: ${tableName}
${order.customerName ? `👤 CUSTOMER: ${order.customerName}\n` : ''}⏰ TIME: ${new Date(order.createdAt).toLocaleTimeString()}

📋 ITEMS:
${order.items.map((item: any) => `${item.quantity}x ${item.name}`).join('\n')}

Total Items: ${order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}`.trim();

    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({
                title: `KOT #${order.id.slice(0, 6)}`,
                text: kotText
            });
        } catch (err) {
            console.error('Share failed:', err);
            navigator.clipboard.writeText(kotText);
            alert('KOT copied to clipboard!');
        }
    } else if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(kotText);
        alert('KOT copied to clipboard!');
    }
};

export const handleShareBill = async (order: Order) => {
    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    const billText = `🧾 BILL - TashiZom
Bill #${order.id.slice(0, 6)}

📍 Table: ${tableName}
${order.customerName ? `👤 Customer: ${order.customerName}\n` : ''}📅 Date: ${new Date(order.createdAt).toLocaleDateString()}
⏰ Time: ${new Date(order.createdAt).toLocaleTimeString()}

ITEMS:
${order.items.map((item: any) => `${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`).join('\n')}

-------------------
TOTAL: ₹${order.totalAmount}
-------------------

Thank you for dining with us! 🙏`.trim();

    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({
                title: `Bill #${order.id.slice(0, 6)}`,
                text: billText
            });
        } catch (err) {
            console.error('Share failed:', err);
            navigator.clipboard.writeText(billText);
            alert('Bill copied to clipboard!');
        }
    } else if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(billText);
        alert('Bill copied to clipboard!');
    }
};
