const fs = require('fs');
const { execSync } = require('child_process');

// 1. Read the menu data
let menu = [];
try {
    const data = fs.readFileSync('menu-data.json', 'utf8');
    const json = JSON.parse(data);
    menu = json.menuItems || [];
} catch (err) {
    console.error("Error reading menu-data.json:", err);
    process.exit(1);
}

// 2. Define Category Mappings (DB Name -> Display Name)
// This ensures items show up under the headers the user expects
const CATEGORY_MAPPING = {
    'Hot Beverages': 'Tea & Coffee',
    'Omelettes': 'Omelets & Egg Dishes',
    'Indian Breads': 'Indian Tawa/Tandoori Roti',
    'Snacks': 'Snacks & Starters',
    'Chinese Course': 'Chinese',
    'Italian Course': 'Pizza & Pasta',
    'Pizza': 'Pizza & Pasta', // Merge Pizza into this
    'Salads': 'Soups & Salads', // Merge
    'Soups': 'Soups & Salads',   // Merge
    'Vegetable & Dishes': 'Main Course (Vegetarian)',
    'Non-Veg': 'Main Course (Non-Vegetarian)'
};

// 3. Define Preferred Display Order (Based on Admin Portal Screenshot)
const PREFERRED_ORDER = [
    'Breakfast',
    'Tea & Coffee',
    'Toasts',
    'Cereals',
    'Omelets & Egg Dishes',
    'Main Course (Vegetarian)',
    'Main Course (Non-Vegetarian)',
    'Indian Tawa/Tandoori Roti',
    'Snacks & Starters',
    'Chinese',
    'Pancakes',
    'Pizza & Pasta',
    'Rice & Biryani',
    'Sandwiches',
    'Desserts',
    'Soups & Salads',
    'Cold Beverages & Shakes'
];

// 4. Transform and Group Data
const groupedMenu = {};

// Initialize groups based on order
PREFERRED_ORDER.forEach(cat => groupedMenu[cat] = []);
const miscCategory = "Others";

menu.forEach(item => {
    let dbCat = item.category;
    // Apply mapping or keep original
    let displayCat = CATEGORY_MAPPING[dbCat] || dbCat;

    // Handle Special Merges manually if mapping didn't catch specific logic
    // (e.g. if 'Snacks' and 'Starters' are separate in DB but one in UI)

    // Ensure array exists
    if (!groupedMenu[displayCat]) {
        // If exact match not found in preferred list, try to find a close match or add to others
        // For now, let's add it to the matching key if it exists in our groups, or create new
        if (PREFERRED_ORDER.includes(displayCat)) {
            // It's in the list
        } else {
            // Check if it should be merged into an existing preferred category
            // e.g. "Veg. Snacks" -> "Snacks & Starters"
            const match = PREFERRED_ORDER.find(p => displayCat.includes(p) || p.includes(displayCat));
            if (match) displayCat = match;
            else {
                // Should we add it to 'Others' or keep it? 
                // Let's keep it to be safe, but append to order
                if (!groupedMenu[displayCat]) groupedMenu[displayCat] = [];
            }
        }
    }

    // If we still don't have a bucket (rare), make one
    if (!groupedMenu[displayCat]) groupedMenu[displayCat] = [];

    groupedMenu[displayCat].push(item);
});

// Remove empty categories
Object.keys(groupedMenu).forEach(key => {
    if (groupedMenu[key].length === 0) delete groupedMenu[key];
});

// Sort items within categories (optional: by SortOrder or Name)
// For now, keep DB order or sort by name? User didn't specify, but DB order is usually best.


// 5. Generate HTML
const htmlContent = `
<html>
<head>
    <title>TashiZom Menu</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            color: #1a1a1a; 
            font-size: 11px; 
            line-height: 1.6; 
        }
        h1 { 
            text-align: center; 
            font-size: 24px; 
            margin-bottom: 5px; 
            text-transform: uppercase; 
            letter-spacing: 2px;
            color: #000;
        }
        .subtitle { 
            text-align: center; 
            font-size: 10px; 
            color: #666; 
            margin-bottom: 25px; 
            letter-spacing: 3px; 
            text-transform: uppercase; 
        }
        
        /* Category Section */
        .category-section { 
            margin-bottom: 25px; 
            break-inside: auto; 
        }
        
        /* Category Title */
        .category-title { 
            font-size: 16px; 
            font-weight: 800; 
            color: #000;
            border-bottom: 2px solid #333; 
            padding-bottom: 4px; 
            margin-bottom: 12px; 
            text-transform: uppercase;
            letter-spacing: 1px;
            page-break-after: avoid;
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            page-break-inside: auto; 
        }
        
        thead { display: table-header-group; }
        
        tr { 
            break-inside: avoid; 
            page-break-inside: avoid; 
        }
        
        /* Increased spacing between items */
        td { 
            border-bottom: 1px solid #e0e0e0; 
            padding: 8px 4px; /* Increased vertical padding from 3px to 8px */
            vertical-align: top; 
        }
        
        th { 
            text-align: left; 
            border-bottom: 2px solid #a0a0a0; 
            padding: 8px 4px; 
            font-size: 10px; 
            text-transform: uppercase; 
            background: #fff;
            color: #444;
            font-weight: bold;
        }
        
        .price { 
            font-weight: 700; 
            text-align: right; 
            white-space: nowrap;
            font-size: 12px;
        }
        
        .price::before {
             /* content: '₹'; in the HTML already */
        }

        .veg { 
            color: #2e7d32; 
            font-weight: 700; 
            font-size: 9px; 
            border: 1px solid #2e7d32;
            padding: 1px 4px;
            border-radius: 4px;
        }
        
        .non-veg { 
            color: #c62828; 
            font-weight: 700; 
            font-size: 9px; 
            border: 1px solid #c62828;
            padding: 1px 4px;
            border-radius: 4px;
        }
        
        .desc { 
            font-size: 10px; 
            color: #666; 
            font-style: italic; 
            margin-top: 2px;
        }
        
        .item-name { 
            font-weight: 700; 
            font-size: 12px;
            color: #000;
        }
    </style>
</head>
<body>
    <h1>TashiZom Homestay</h1>
    <p class="subtitle">KIBBER • SPITI VALLEY</p>
    
    ${PREFERRED_ORDER.map(category => {
    const items = groupedMenu[category];
    if (!items || items.length === 0) return '';

    return `
        <div class="category-section">
            <div class="category-title">${category}</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%">Item / Description</th>
                        <th style="width: 15%; text-align: center;">Type</th>
                        <th style="width: 15%; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name}</div>
                                <div class="desc">${item.description || ''}</div>
                            </td>
                            <td style="text-align: center;">
                                <span class="${item.isVegetarian ? 'veg' : 'non-veg'}">
                                    ${item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                </span>
                            </td>
                            <td class="price">₹${item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
}).join('')}
    
    <!-- Print remaining categories not in preferred order -->
    ${Object.keys(groupedMenu).filter(cat => !PREFERRED_ORDER.includes(cat)).map(category => {
    const items = groupedMenu[category];
    if (!items || items.length === 0) return '';
    return `
        <div class="category-section">
            <div class="category-title">${category}</div>
             <table>
                <thead>
                    <tr>
                        <th style="width: 40%">Item / Description</th>
                        <th style="width: 15%; text-align: center;">Type</th>
                        <th style="width: 15%; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name}</div>
                                <div class="desc">${item.description || ''}</div>
                            </td>
                            <td style="text-align: center;">
                                <span class="${item.isVegetarian ? 'veg' : 'non-veg'}">
                                    ${item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                </span>
                            </td>
                            <td class="price">₹${item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
         `;
}).join('')}

</body>
</html>
`;

fs.writeFileSync('menu_print.html', htmlContent);
console.log('Successfully generated menu_print.html');

// Try to generate PDF immediately using Edge
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputPdf = "d:\\Reference_Projects\\charged-satellite\\TashiZom_Menu_Printable.pdf";
const inputHtml = "d:\\Reference_Projects\\charged-satellite\\menu_print.html";

if (fs.existsSync(edgePath)) {
    try {
        execSync(`"${edgePath}" --headless --print-to-pdf="${outputPdf}" "${inputHtml}"`);
        console.log("PDF Generated via Edge");
    } catch (e) {
        console.error("Failed to generate PDF via Edge", e);
    }
}
