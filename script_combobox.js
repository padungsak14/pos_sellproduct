const cbbPRO = document.getElementById('cbbPRO');
const conSearch_combobox = document.getElementById('conSearch_combobox');
const conList_pro = document.getElementById('conList_pro');


async function getProductAll(xComid) {
    try {
        const url = `${fetch_IP}${fetch_Port}/api/getProductAll`;
        const response = await fetch(url ,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({comid: xComid})
        })

        if (response.ok) {
            const data = await response.json();
            createOption_cbbPRO(data);
        } else if (response.status === 404) {
            console.log('Product Not Found.');
        } else {
            // ถ้าไม่ใช่ status 200 และ 404 ให้แจ้งผลลัพธ์ตามสถานะที่ได้รับ
            console.log(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        // จัดการข้อผิดพลาดที่อาจเกิดขึ้นจาก fetch
        console.error('Fetch error:', error);
    }
}

function createOption_cbbPRO(data) {
    console.log('data: ',data);

    const con_fragment = document.createDocumentFragment();
    data.forEach(row => {
        let item = document.createElement('li');
        item.textContent = row.fcName;
        item.setAttribute('data-barcode',row.fcBarCode);

        let pro_Sellprice = document.createElement('p');
        pro_Sellprice.textContent = '฿'+row.fnSellPrice;

        item.appendChild(pro_Sellprice);
        con_fragment.appendChild(item);
    })
    conList_pro.append(con_fragment);
}



//==== เลือก cbbPRO
conSearch_combobox.addEventListener('click' ,function(e) {
    const combobox = e.target.closest('#conCombobox');
    const selected = e.target.closest('li');
    if (combobox) {
        if (conSearch_combobox.classList.contains('active')) {
            console.log('มี active อยู่แล้ว');
        }
        else {
            console.log('Add active');
            conSearch_combobox.classList.add('active');
        }
    }

    if (selected) {
        const xbarcode = selected.getAttribute('data-barcode');
        if (xbarcode) {
            getbarcode(xbarcode);
        }
        const text = selected.textContent;
        const endCopy = text.indexOf('฿');
        if (endCopy !== -1) {
            const xvalue = text.substring(0 ,endCopy);
            cbbPRO.value = xvalue;
        }
        else {
            cbbPRO.value = text; 
        }
        conSearch_combobox.classList.remove('active');

        console.log('เลือก : ',selected);
    }
})

document.addEventListener('click', function(e) {
    if (!conSearch_combobox.contains(e.target)) {
        conSearch_combobox.classList.remove('active');
    }
});

cbbPRO.addEventListener('input' ,function() {
    const text = cbbPRO.value.toLowerCase();
    const conList_pro = document.getElementById('conList_pro');
    if (conList_pro) {
        const items = conList_pro.querySelectorAll('li');
        if (items) {
            items.forEach(item => {
                if (item.textContent.toLowerCase().includes(text)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }

            })
        }
    }
})
