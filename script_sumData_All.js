function sumData_All() {
    const body_data = document.getElementById('tbody-data');
    
    if (body_data) {
        const edtDiscount = document.getElementById('edtDiscount');
        const data_rows = body_data.querySelectorAll('tr[data-proid]');
        if (data_rows && data_rows.length > 0) {
            let xNetamt = 0;
            let xItemsQty = parseFloat(data_rows.length); //รวม รายการ
            let xUnitQty = 0; //รวม ชิ้น

            data_rows.forEach(row => {
                const xNet = row.querySelector('[data-netamt]').getAttribute('data-netamt');
                const xQty = row.querySelector('#edtSellqty').value;
                xNetamt += parseFloat(xNet);
                xUnitQty += parseFloat(xQty);
            })

            xNetamt = xNetamt - parseFloat(edtDiscount.value ?? 0);

            const lbItemsQty = document.getElementById('lbItemsQty');
            const lbUnitQty = document.getElementById('lbUnitQty');
            const lbNetAmt = document.getElementById('lbNetAmt');

            lbItemsQty.textContent = formated.format(xItemsQty) + ' รายการ';
            lbUnitQty.textContent = formated.format(xUnitQty) + ' ชิ้น';
            lbNetAmt.textContent = '฿ ' +formated.format(xNetamt);
        }
    }
}