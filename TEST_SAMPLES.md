# Exemples de code pour tester les modules de formatage/minification

## 1. Code Formatter

### JavaScript (à formater)
```javascript
function calculateTotal(items){let total=0;for(let i=0;i<items.length;i++){total+=items[i].price*items[i].quantity}return total}
```

### JSON (à formater)
```json
{"name":"John","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zip":"10001"}}
```

### XML (à formater)
```xml
<root><user id="1"><name>John Doe</name><email>john@example.com</email><roles><role>admin</role><role>user</role></roles></user></root>
```

### HTML (à formater)
```html
<div class="container"><h1>Title</h1><p>Paragraph text</p><ul><li>Item 1</li><li>Item 2</li></ul></div>
```

### CSS (à formater)
```css
.container{width:100%;padding:20px;margin:0}.header{background:#fff;color:#000}.button{padding:10px 20px;border:none;cursor:pointer}
```

---

## 2. CSS Minifier

### CSS à minifier
```css
/* Header Styles */
.header {
    width: 100%;
    padding: 20px;
    margin: 0 auto;
    background-color: #ffffff;
    color: #333333;
    font-family: Arial, sans-serif;
}

/* Button Styles */
.button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: #0056b3;
}

/* Container Styles */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Media Query */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .button {
        width: 100%;
    }
}
```

---

## 3. JS Minifier

### JavaScript à minifier
```javascript
// Calculate total price
function calculateTotal(items) {
    let total = 0;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        total += price * quantity;
    }
    
    return total;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Main function
function processOrder(order) {
    const total = calculateTotal(order.items);
    const formattedTotal = formatCurrency(total);
    
    console.log('Order total:', formattedTotal);
    
    return {
        total: total,
        formatted: formattedTotal
    };
}
```

---

## 4. JSON Formatter/Minifier

### JSON à formater
```json
{"users":[{"id":1,"name":"John Doe","email":"john@example.com","active":true,"roles":["admin","user"],"preferences":{"theme":"dark","notifications":true},"metadata":{"created":"2024-01-15","lastLogin":"2024-01-20"}},{"id":2,"name":"Jane Smith","email":"jane@example.com","active":true,"roles":["user"],"preferences":{"theme":"light","notifications":false},"metadata":{"created":"2024-01-10","lastLogin":"2024-01-19"}}],"total":2,"page":1,"limit":10}
```

### JSON déjà formaté (à minifier)
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "active": true,
      "roles": [
        "admin",
        "user"
      ],
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "metadata": {
        "created": "2024-01-15",
        "lastLogin": "2024-01-20"
      }
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "active": true,
      "roles": [
        "user"
      ],
      "preferences": {
        "theme": "light",
        "notifications": false
      },
      "metadata": {
        "created": "2024-01-10",
        "lastLogin": "2024-01-19"
      }
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10
}
```

---

## 5. XML Formatter/Minifier

### XML à formater
```xml
<?xml version="1.0" encoding="UTF-8"?><catalog><book id="1"><title>JavaScript: The Good Parts</title><author>Douglas Crockford</author><year>2008</year><price currency="USD">29.99</price><categories><category>Programming</category><category>Web Development</category></categories></book><book id="2"><title>Clean Code</title><author>Robert C. Martin</author><year>2008</year><price currency="USD">45.00</price><categories><category>Programming</category><category>Software Engineering</category></categories></book></catalog>
```

### XML déjà formaté (à minifier)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
    <book id="1">
        <title>JavaScript: The Good Parts</title>
        <author>Douglas Crockford</author>
        <year>2008</year>
        <price currency="USD">29.99</price>
        <categories>
            <category>Programming</category>
            <category>Web Development</category>
        </categories>
    </book>
    <book id="2">
        <title>Clean Code</title>
        <author>Robert C. Martin</author>
        <year>2008</year>
        <price currency="USD">45.00</price>
        <categories>
            <category>Programming</category>
            <category>Software Engineering</category>
        </categories>
    </book>
</catalog>
```

---

## Notes de test

- **Code Formatter** : Testez avec différents langages (auto-détection, JavaScript, JSON, XML, HTML, CSS)
- **CSS Minifier** : Vérifiez que les commentaires et espaces sont supprimés
- **JS Minifier** : Vérifiez que les commentaires et espaces sont supprimés
- **JSON Formatter** : Testez format (beautify) et minify, vérifiez la validation JSON
- **XML Formatter** : Testez format (beautify) et minify, vérifiez la validation XML



