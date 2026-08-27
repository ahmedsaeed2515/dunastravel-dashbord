const fs = require('fs');

const file = 'd:/@@project/LUXURY-PROJECT/dunastravel-dashbord/src/components/core/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  CarFront,',
  '  CarFront,\n  BookOpen,'
);

content = content.replace(
  '<NavItem href={adminRoutes.transportation} icon={CarFront} label="Transportation" />',
  '<NavItem href={adminRoutes.transportation} icon={CarFront} label="Transportation" />\n                  <NavItem href={adminRoutes.blogs} icon={BookOpen} label="Blogs & Journal" />'
);

fs.writeFileSync(file, content);
console.log('AppSidebar updated correctly');
