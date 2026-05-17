
//ENG+อักขระพิเศษ
function isEngName(evt) {

    var EnglishAlphabetAndWhiteSpace = /[((A-Za-z-0-9/@)"'&#,:;<> ).]/;

    var key = String.fromCharCode(evt.which);

    if (EnglishAlphabetAndWhiteSpace.test(key)) {
        return true;
    }

    return false;
}

//เฉพาะตัวเลข
function isNumber(evt) {

    var Numb = /^[0-9]*$/;

    var key = String.fromCharCode(evt.which);

    if (Numb.test(key)) {
        return true;
    }

    return false;

}
// ✅ เพิ่มบรรทัดนี้เพื่อให้ Angular ใช้ได้
// window.isNumber = isNumber;


//เฉพาะตัวเลขหน้าแก้ไข
function isNumberEdit(evt) {

    var Numb = /^[0-9]*$/;

    var key = String.fromCharCode(evt.which);

    if (Numb.test(key)) {
        return true;
    }

    return false;
}

//แปลง Date
function Convert_Date_eng_check(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    if (yyyy < 2500) {
        // return yyyy + '-' + mm + '-' + dd
        return dd + '-' + mm + '-' + yyyy
    } else {
        // return (yyyy - 543) + '-' + mm + '-' + dd
        return dd + '-' + mm + '-' + (yyyy - 543)
    }
}

function isValidEmailFormat(email) {
    // Regular Expression เพื่อตรวจสอบรูปแบบของ Email
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email); // คืนค่า true ถ้า email มีรูปแบบถูกต้อง
}

function containsAtAndDot(email) {
    // ตรวจสอบว่ามี @ และ . ในข้อความ
    return email.includes('@') && email.includes('.');
}


// หน้าบ้านของ function validateEmailKey
// {/* <input type="text" onkeypress="return validateEmailKey(event)" /> */}

function validateEmailKey(evt) {
    var key = String.fromCharCode(evt.which);

    // อนุญาตให้ป้อนเฉพาะอักษร, ตัวเลข, @, ., และเครื่องหมายบางตัว
    var allowedChars = /^[a-zA-Z0-9@._-]*$/;

    if (allowedChars.test(key)) {
        return true;
    }
    return false; // ปฏิเสธคีย์ที่ไม่ใช่ตัวอักษรที่กำหนด
}

// function dateDis() {
//   let dateshow ;
//   dateshow.datepicker({ minDate: 0, maxDate: "+1M +10D" })
//   return dateshow;
// };