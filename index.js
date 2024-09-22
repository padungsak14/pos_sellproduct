let barcode = '';
let timeout = null;
const fetch_IP = 'http://127.0.0.1';
const fetch_Port = ':5000';

const formated = new Intl.NumberFormat('en-TH' ,{
   minimumFractionDigits: 2, // ให้แสดงทศนิยม 2 ตำแหน่ง
    maximumFractionDigits: 2  // ให้แสดงทศนิยมไม่เกิน 2 ตำแหน่ง
})

const data_test = [{"fnQtyLeft":2.00,"Product":{"ID":"ACEDD47D-706F-45DC-A950-AD174D4C5FC1","Code":"0001","Name":"Nestea 13g","BarCode":"8850127007176","CostPrice":0.00,"SellPrice":7.00}},{"fnQtyLeft":-0.20,"Product":{"ID":"AFD99543-775F-44E0-A45D-D35F8F53897B","Code":"0002","Name":"Nestea 50g","BarCode":"8851932375719","CostPrice":0.00,"SellPrice":20.00}},{"fnQtyLeft":34.00,"Product":{"ID":"66BEE938-D377-4855-BB3D-DF366B94A39D","Code":"0003","Name":"โอวัลติน 29g","BarCode":"8850086130359","CostPrice":0.00,"SellPrice":25.00}},{"fnQtyLeft":20.00,"Product":{"ID":"B667F2CB-A350-4C1A-B63F-11CFFBA2EF40","Code":"0004","Name":"Nescafe เขียว","BarCode":"8850124012869","CostPrice":0.00,"SellPrice":15.00}},{"fnQtyLeft":1.82,"Product":{"ID":"CA2912F6-95E8-4AF1-B67C-986943D5A2A8","Code":"0005","Name":"Nescafe ชมพู","BarCode":"021816901","CostPrice":0.00,"SellPrice":100.00}}]

document.body.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const barcode_finish = barcode;
        barcode = '';  
        clearTimeout(timeout);  // ยกเลิก timeout ที่เหลืออยู่
        if (barcode_finish && barcode_finish.length > 5) {
            getbarcode(barcode_finish);
        }
    }
});

document.body.addEventListener('keyup', function(e) {
    // ตรวจสอบเฉพาะตัวอักษรและตัวเลขเท่านั้น
    if (/^[a-zA-Z0-9]$/.test(e.key)) {
        barcode += e.key;  
        // console.log(barcode);
        clearTimeout(timeout);  // เคลียร์ timeout ก่อนหน้า
    }

    // ตั้ง timeout เพื่อล้างค่า barcode หลังจาก 1 วินาทีถ้าไม่มีการกดปุ่มเพิ่มเติม
    timeout = setTimeout(() => {
        barcode = '';
    }, 1000);
});


async function getbarcode(xbarcode) {
    const url = `${fetch_IP}${fetch_Port}/api/getbarcode`;
    console.log(url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ barcode: xbarcode })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('data:', data);

            const tbody = document.getElementById('tbody-data');


            const xrecPROID_intable = tbody.querySelector(`[data-proid="${data[0].fcID}"]`)

            if (xrecPROID_intable) {
                //==== ถ้าสินค้ามีในตารางอยู่แล้ว ให้ จำนวน +1 และคงเหลือ -1
                const proQtyleft = xrecPROID_intable.querySelector('[data-qtyleft]');
                const prosellPrice = xrecPROID_intable.querySelector('#edtSellprice');
                const prosellQty = xrecPROID_intable.querySelector('#edtSellqty');
                const proDiscperone = xrecPROID_intable.querySelector('#edtDiscperone');
                const pronetAmt = xrecPROID_intable.querySelector('[data-netamt]');
            
                
                const xqtyLeft = parseFloat(proQtyleft.textContent ?? 1) -1;
                proQtyleft.textContent = xqtyLeft;
                proQtyleft.setAttribute('data-qtyleft' ,xqtyLeft);
            
                const xqty = parseFloat(prosellQty.value ?? 1) +1;
                prosellQty.value = xqty;

                sumdata(xrecPROID_intable);
            }
            else {
                //==== select Database เพื่อหาต้นทุน รวมภาษี
                const xcostPrice = await getbarcode_cost(data[0].fcID) ?? 0;

                let tr_new = document.createElement('tr');
                tr_new.setAttribute('data-proid' ,data[0].fcID);
                tr_new.setAttribute('data-costprice' ,xcostPrice);
                tr_new.setAttribute('data-discamt' ,'0.00');
                tr_new.setAttribute('data-totalamt' ,data[0].fnSellPrice);

                let td_proCode = document.createElement('td');
                td_proCode.textContent = data[0].fcCode;

                let td_proName = document.createElement('td');
                td_proName.textContent = data[0].fcName;
                
                let td_proQtyleft = document.createElement('td');
                td_proQtyleft.textContent = data[0].fnQtyLeft;
                td_proQtyleft.setAttribute('data-qtyleft' ,data[0].fnQtyLeft)

                let td_prosellPrice = document.createElement('td');

                let edtSellprice = document.createElement('input');
                edtSellprice.type = 'text';
                edtSellprice.id = 'edtSellprice';
                edtSellprice.className = 'edt_intable';
                edtSellprice.value = data[0].fnSellPrice;
                edtSellprice.autocomplete = 'off';

                let td_prosellQty = document.createElement('td');

                let edtSellqty = document.createElement('input');
                edtSellqty.type = 'text';
                edtSellqty.id = 'edtSellqty';
                edtSellqty.className = 'edt_intable';
                edtSellqty.value = '1.00';
                edtSellqty.autocomplete = 'off';

                let td_proDiscperone = document.createElement('td');

                let edtDiscperone = document.createElement('input');
                edtDiscperone.type = 'text';
                edtDiscperone.id = 'edtDiscperone';
                edtDiscperone.className = 'edt_intable';
                edtDiscperone.value = '0.00';
                edtDiscperone.autocomplete = 'off';

                let td_proNetamt = document.createElement('td');
                td_proNetamt.textContent = data[0].fnSellPrice;
                td_proNetamt.setAttribute('data-netamt' ,data[0].fnSellPrice)

                let td_icon_del = document.createElement('td');

                let icon_del = document.createElement('i');
                icon_del.className = 'fa-solid fa-circle-minus icon-del';
                icon_del.id = 'icon-del';



                td_prosellPrice.append(edtSellprice);
                td_prosellQty.append(edtSellqty);
                td_proDiscperone.append(edtDiscperone);
                td_icon_del.append(icon_del);
                tr_new.append(td_proCode ,td_proName ,td_proQtyleft ,td_prosellPrice ,td_prosellQty ,td_proDiscperone ,td_proNetamt ,td_icon_del);
                tbody.append(tr_new);
            }

            sumData_All();
        }
        else if (response.status === 404) {
            console.log('Product Not Found.');
        }
        else { 
            // ถ้าไม่ใช่ status 200 และ 404 ให้แจ้งผลลัพธ์ตามสถานะที่ได้รับ
            console.log(`Error: ${response.status} ${response.statusText}`);
        }

    } catch (error) {
        // จัดการข้อผิดพลาดที่อาจเกิดขึ้นจาก fetch
        console.error('Fetch error:', error);
    }
}

async function getbarcode_cost(xproid) {
    try {
        if (xproid) {
            const url = `${fetch_IP}${fetch_Port}/api/getbarcode/costprice`;
            const response = await fetch(url ,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({proid: xproid})
            });  
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                return data.fnStockCostPrice;
            }
            else if (response.status === 404) {
                console.log('Fetch not found');
                return 0;
            }
            else {
                console.log(`Error: ${response.status} ${response.statusText}`);
                return 0;
            }
    
        }
        else {
            console.error('Fetch error: pro not found');
            return 0;
        }

    } catch (error) {
        console.error('Fetch error:', error);
        return 0;
    }
}

//==== คำนวณราคาในแถว
function sumdata(tr_pro) {
    const proQtyleft = tr_pro.querySelector('[data-qtyleft]');
    const prosellPrice = tr_pro.querySelector('#edtSellprice');
    const prosellQty = tr_pro.querySelector('#edtSellqty');
    const proDiscperone = tr_pro.querySelector('#edtDiscperone');
    const pronetAmt = tr_pro.querySelector('[data-netamt]');

    const xqtyLeft = parseFloat(proQtyleft.textContent || 1);
    proQtyleft.textContent = xqtyLeft;
    proQtyleft.setAttribute('data-qtyleft' ,xqtyLeft);

    const xqty = parseFloat(prosellQty.value || 1);
    // prosellQty.value = xqty;

    // const xqtyLeft = parseFloat(proQtyleft.textContent ?? 1) -1;
    // proQtyleft.textContent = xqtyLeft;
    // proQtyleft.setAttribute('data-qtyleft' ,xqtyLeft);

    // const xqty = parseFloat(prosellQty.value ?? 1) +1;
    // prosellQty.value = xqty;

    const xproamt = xqty * parseFloat(prosellPrice.value || 0);
    const xnetAmt = xproamt - (xqty * parseFloat(proDiscperone.value || 0));
    tr_pro.setAttribute('data-discamt',(xqty * parseFloat(proDiscperone.value || 0)));
    tr_pro.setAttribute('data-totalamt' ,xproamt);

    pronetAmt.textContent = formated.format(xnetAmt);
    pronetAmt.setAttribute('data-netamt' ,xnetAmt);

    sumData_All();
}


const tbody_data = document.getElementById('tbody-data');

tbody_data.addEventListener('input' ,function(e) {
    const edtSellprice = e.target.closest('#edtSellprice');
    const edtSellqty = e.target.closest('#edtSellqty');
    const edtDiscperone = e.target.closest('#edtDiscperone');

    //==== แก้ไขราคาต่อชิ้น
    if (edtSellprice) {
        // ป้องกันการกรอกตัวอักษรและยอมรับจุดทศนิยมเพียง 1 จุดเท่านั้น
        edtSellprice.value = edtSellprice.value.replace(/[^0-9.]/g, ''); // ยอมรับเฉพาะตัวเลขและจุดทศนิยม
        edtSellprice.value = edtSellprice.value.replace(/(\..*)\./g, '$1'); // ตรวจสอบไม่ให้มีจุดทศนิยมเกิน 1 จุด

        // //==== ป้องกันถ้าเป็นค่าว่าง
        // if (edtSellprice.value.length === 0) {
        //     edtSellprice.value = 1.00;
        // }

        const tr_data = edtSellprice.closest('[data-proid]');
        sumdata(tr_data);
    }

    //==== แก้ไขจำนวนสินค้า
    if (edtSellqty) {
        edtSellqty.value = edtSellqty.value.replace(/[^0-9.]/g, ''); // ยอมรับเฉพาะตัวเลขและจุดทศนิยม
        edtSellqty.value = edtSellqty.value.replace(/(\..*)\./g, '$1'); // ตรวจสอบไม่ให้มีจุดทศนิยมเกิน 1 จุด

        //==== ป้องกันถ้าเป็นค่าว่าง
        // if (edtSellqty.value.length === 0) {
        //     edtSellqty.value = 1.00;
        // }

        const tr_data = edtSellqty.closest('[data-proid]');
        sumdata(tr_data);
    }

    //==== แก้ไขส่วนลด
    if (edtDiscperone) {
        edtDiscperone.value = edtDiscperone.value.replace(/[^0-9.]/g, ''); // ยอมรับเฉพาะตัวเลขและจุดทศนิยม
        edtDiscperone.value = edtDiscperone.value.replace(/(\..*)\./g, '$1'); // ตรวจสอบไม่ให้มีจุดทศนิยมเกิน 1 จุด

        // //==== ป้องกันถ้าเป็นค่าว่าง
        // if (edtDiscperone.value.length === 0) {
        //     edtDiscperone.value = 0.00;
        // }

        const tr_data = edtDiscperone.closest('[data-proid]');
        sumdata(tr_data);
    }
})

tbody_data.addEventListener('focusout' ,function(e) {
    const edtSellprice = e.target.closest('#edtSellprice');
    const edtSellqty = e.target.closest('#edtSellqty');
    const edtDiscperone = e.target.closest('#edtDiscperone');

    //==== แก้ไขราคาต่อชิ้น
    if (edtSellprice) {
        //==== ป้องกันถ้าเป็นค่าว่าง
        if (edtSellprice.value.length === 0) {
            edtSellprice.value = 1.00;
        }
        edtSellprice.value = edtSellprice.value;
        const tr_data = edtSellprice.closest('[data-proid]');
        sumdata(tr_data);
    }

    //==== แก้ไขจำนวนสินค้า
    if (edtSellqty) {
        //==== ป้องกันถ้าเป็นค่าว่าง
        if (edtSellqty.value.length === 0) {
            edtSellqty.value = 1.00;
        }
        const tr_data = edtSellqty.closest('[data-proid]');
        sumdata(tr_data);
    }

    //==== แก้ไขส่วนลด
    if (edtDiscperone) {
        //==== ป้องกันถ้าเป็นค่าว่าง
        if (edtDiscperone.value.length === 0) {
            edtDiscperone.value = 0.00;
        }
        const tr_data = edtDiscperone.closest('[data-proid]');
        sumdata(tr_data);
    }
})


tbody_data.addEventListener('click' ,function(e) {
    const icon_del = e.target.closest('#icon-del');
    if (icon_del) {
        icon_del.closest('[data-proid]').remove();
    }
})

document.addEventListener('DOMContentLoaded' ,function() {
    getProductAll('620CC2EB-CAE1-4642-84E7-9428FC891E2D');
})

function ajaxTounigui() {
    ajaxRequest(UniURLFrame1, 'testajax', ['xbarcode=123']);
}