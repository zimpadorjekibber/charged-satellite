const fs = require('fs');

try {
    const data = fs.readFileSync('menu-data.json', 'utf8');
    const json = JSON.parse(data);
    const menu = json.menuItems || [];

    // Count items per category
    const categoryCounts = {};
    menu.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const output = JSON.stringify(categoryCounts, null, 2);
    fs.writeFileSync('category_analysis.txt', output);
    console.log("Analysis saved to category_analysis.txt");

} catch (err) {
    console.error("Error:", err);
}
