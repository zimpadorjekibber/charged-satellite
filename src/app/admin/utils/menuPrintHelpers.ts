import { MenuItem } from '@/lib/store';

export const PREFERRED_ORDER = [
    'Breakfast',
    'Snacks & Starters',
    'Main Course (Vegetarian)',
    'Main Course (Non-Vegetarian)',
    'Rice & Biryani',
    'Tandoor & Breads',
    'Chinese',
    'Pizza & Pasta',
    'Tea & Coffee',
    'Cold Beverages & Shakes',
    'Desserts'
];

export const handlePrintMenu = (menu: MenuItem[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const groupedMenu: Record<string, MenuItem[]> = {};
    menu.forEach(item => {
        if (!groupedMenu[item.category]) groupedMenu[item.category] = [];
        groupedMenu[item.category].push(item);
    });

    // Sort items within categories
    Object.keys(groupedMenu).forEach(key => {
        groupedMenu[key].sort((a, b) => {
            const orderA = (a.sortOrder !== undefined && a.sortOrder !== null) ? a.sortOrder : 999;
            const orderB = (b.sortOrder !== undefined && b.sortOrder !== null) ? b.sortOrder : 999;
            return orderA - orderB;
        });
    });

    printWindow.document.write(`
        <html>
        <head>
            <title>TashiZom Menu</title>
            <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; color: #000; font-size: 13px; line-height: 1.5; }
                h1 { text-align: center; font-size: 28px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
                .subtitle { text-align: center; font-size: 12px; color: #444; margin-bottom: 25px; letter-spacing: 3px; text-transform: uppercase; }
                .category-section { margin-bottom: 25px; break-inside: auto; }
                .category-title { font-size: 18px; font-weight: 800; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; page-break-after: avoid; }
                table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                thead { display: table-header-group; }
                tr { break-inside: avoid; page-break-inside: avoid; }
                td { border-bottom: 1px solid #ddd; padding: 8px 4px; vertical-align: top; }
                th { text-align: left; border-bottom: 2px solid #666; padding: 6px 4px; font-size: 11px; text-transform: uppercase; background: #fff; font-weight: bold; }
                .price { font-weight: bold; text-align: right; white-space: nowrap; font-size: 14px; }
                .desc { font-size: 11px; color: #555; font-style: italic; margin-top: 2px; }
                .item-name { font-weight: bold; font-size: 14px; }
                .veg { color: green; font-weight: bold; font-size: 10px; border: 1px solid green; padding: 1px 3px; border-radius: 3px; }
                .non-veg { color: red; font-weight: bold; font-size: 10px; border: 1px solid red; padding: 1px 3px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>TashiZom</h1>
            <p class="subtitle">KIBBER • SPITI VALLEY</p>
            ${PREFERRED_ORDER.map(cat => {
        const items = groupedMenu[cat];
        if (!items || items.length === 0) return '';
        const hideType = ['Tea & Coffee', 'Cold Beverages & Shakes'].includes(cat);
        return (
            '<div class="category-section">' +
            '<div class="category-title">' + cat + '</div>' +
            '<table>' +
            '<thead>' +
            '<tr>' +
            '<th style="width: ' + (hideType ? '85%' : '50%') + '">Item</th>' +
            (!hideType ? '<th style="width: 15%; text-align: center;">Type</th>' : '') +
            '<th style="width: 15%; text-align: right;">Price</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            items.map(item => (
                '<tr>' +
                '<td>' +
                '<div class="item-name">' + item.name + '</div>' +
                '<div class="desc">' + (item.description || '') + '</div>' +
                '</td>' +
                (!hideType ? (
                    '<td style="text-align: center;">' +
                    '<span class="' + (item.isVegetarian ? 'veg' : 'non-veg') + '">' +
                    (item.isVegetarian ? 'VEG' : 'NON-VEG') +
                    '</span>' +
                    '</td>') : '') +
                '<td class="price">₹' + item.price + '</td>' +
                '</tr>'
            )).join('') +
            '</tbody>' +
            '</table>' +
            '</div>'
        );
    }).join('')}
            ${Object.keys(groupedMenu).filter(k => !PREFERRED_ORDER.includes(k) && groupedMenu[k].length > 0).map(cat => {
        const hideType = ['Tea & Coffee', 'Cold Beverages & Shakes'].includes(cat);
        return (
            '<div class="category-section">' +
            '<div class="category-title">' + cat + '</div>' +
            '<table>' +
            '<thead>' +
            '<tr>' +
            '<th style="width: ' + (hideType ? '85%' : '50%') + '">Item</th>' +
            (!hideType ? '<th style="width: 15%; text-align: center;">Type</th>' : '') +
            '<th style="width: 15%; text-align: right;">Price</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            groupedMenu[cat].map(item => (
                '<tr>' +
                '<td>' +
                '<div class="item-name">' + item.name + '</div>' +
                '<div class="desc">' + (item.description || '') + '</div>' +
                '</td>' +
                (!hideType ? (
                    '<td style="text-align: center;">' +
                    '<span class="' + (item.isVegetarian ? 'veg' : 'non-veg') + '">' +
                    (item.isVegetarian ? 'VEG' : 'NON-VEG') +
                    '</span>' +
                    '</td>') : '') +
                '<td class="price">₹' + item.price + '</td>' +
                '</tr>'
            )).join('') +
            '</tbody>' +
            '</table>' +
            '</div>'
        );
    }).join('')}
            <script>
                window.onload = function() { setTimeout(function(){ window.print(); }, 500); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
