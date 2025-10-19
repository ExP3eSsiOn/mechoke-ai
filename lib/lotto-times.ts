// lib/lotto-times.ts
// Generated from CSV: MECHOKE รายชื่อหวยทั้งหมด - lotto-times.ts.csv
export type DrawTime = {
    id: string;
    group: "laos" | "hanoi" | "thai_stocks" | "thai_gov" | "intl_stocks" | "yeekee" | "others";
    name: string;
    aliases: string[];
    days?: string[];
    closeAt?: string;
    announceAt?: string;
    note?: string;
  };
  
  export const DRAW_TIMES: DrawTime[] = [
    { id: "หวยสาละวัน-visa", group: "laos", name: "หวยสาละวัน VISA", aliases: ["หวยสาละวัน VISA"], closeAt: "05:00", announceAt: "05:15" },
    { id: "หวยลาวประตูชัย", group: "laos", name: "หวยลาวประตูชัย", aliases: ["หวยลาวประตูชัย"], closeAt: "05:40", announceAt: "05:45" },
    { id: "หวยหลวงพระบาง-visa", group: "laos", name: "หวยหลวงพระบาง VISA", aliases: ["หวยหลวงพระบาง VISA"], closeAt: "06:05", announceAt: "06:15" },
    { id: "หวยลาวสันติภาพ", group: "laos", name: "หวยลาวสันติภาพ", aliases: ["หวยลาวสันติภาพ"], closeAt: "06:40", announceAt: "06:45" },
    { id: "หวยเวียงจันทร์-visa", group: "laos", name: "หวยเวียงจันทร์ VISA", aliases: ["หวยเวียงจันทร์ VISA"], closeAt: "07:05", announceAt: "07:15" },
    { id: "หวยประชาชนลาว", group: "laos", name: "หวยประชาชนลาว", aliases: ["หวยประชาชนลาว"], closeAt: "07:40", announceAt: "07:45" },
    { id: "หวยลาว-visa", group: "laos", name: "หวยลาว VISA", aliases: ["หวยลาว VISA"], closeAt: "08:00", announceAt: "08:15" },
    { id: "หวยฮานอยเช้า", group: "hanoi", name: "หวยฮานอยเช้า", aliases: ["หวยฮานอยเช้า"], closeAt: "08:10", announceAt: "08:30" },
    { id: "หวยลาวเช้า", group: "laos", name: "หวยลาวเช้า", aliases: ["หวยลาวเช้า"], closeAt: "08:15", announceAt: "08:30" },
    { id: "หวยลาว-extra", group: "laos", name: "หวยลาว EXTRA", aliases: ["หวยลาว EXTRA"], closeAt: "08:20", announceAt: "08:30" },
    { id: "นิเคอิรอบเช้า-vip", group: "intl_stocks", name: "นิเคอิรอบเช้า VIP", aliases: ["นิเคอิรอบเช้า VIP"], closeAt: "08:40", announceAt: "09:05" },
    { id: "ลาวพัฒนาเช้า", group: "laos", name: "ลาวพัฒนาเช้า", aliases: ["ลาวพัฒนาเช้า"], closeAt: "08:45", announceAt: "09:00" },
    { id: "นิเคอิพิเศษ-เช้า", group: "intl_stocks", name: "นิเคอิพิเศษ เช้า", aliases: ["นิเคอิพิเศษ เช้า"], closeAt: "08:50", announceAt: "09:05" },
    { id: "หวย-ธกส", group: "thai_gov", name: "หวย ธกส.", aliases: ["หวย ธกส."], closeAt: "วันที่ 16 เวลา 09:00", announceAt: "16:00" },
    { id: "นิเคอิ-visa-เช้า", group: "intl_stocks", name: "นิเคอิ VISA (เช้า)", aliases: ["นิเคอิ VISA (เช้า)"], closeAt: "09:00", announceAt: "09:15" },
    { id: "หวยฮานอยอาเชียน", group: "hanoi", name: "หวยฮานอยอาเชียน", aliases: ["หวยฮานอยอาเชียน"], closeAt: "09:15", announceAt: "09:30" },
    { id: "นิเคอิรอบเช้า", group: "intl_stocks", name: "นิเคอิรอบเช้า", aliases: ["นิเคอิรอบเช้า"], closeAt: "09:20", announceAt: "09:30" },
    { id: "ลาวพัฒนาเช้า-vip", group: "laos", name: "ลาวพัฒนาเช้า VIP", aliases: ["ลาวพัฒนาเช้า VIP"], closeAt: "09:45", announceAt: "10:00" },
    { id: "จีนพิเศษ-เช้า", group: "intl_stocks", name: "จีนพิเศษ เช้า", aliases: ["จีนพิเศษ เช้า"], closeAt: "09:50", announceAt: "10:05" },
    { id: "หุ้นจีนรอบเช้า-vip", group: "intl_stocks", name: "หุ้นจีนรอบเช้า VIP", aliases: ["หุ้นจีนรอบเช้า VIP"], closeAt: "10:00", announceAt: "10:05" },
    { id: "จีน-visa-เช้า", group: "intl_stocks", name: "จีน VISA (เช้า)", aliases: ["จีน VISA (เช้า)"], closeAt: "10:00", announceAt: "10:15" },
    { id: "หวยลาว-tv", group: "laos", name: "หวยลาว TV", aliases: ["หวยลาว TV"], closeAt: "10:15", announceAt: "10:30" },
    { id: "หุ้นจีนเช้า", group: "intl_stocks", name: "หุ้นจีนเช้า", aliases: ["หุ้นจีนเช้า"], closeAt: "10:15", announceAt: "10:30" },
    { id: "ฮั่งเส็งรอบเช้า-vip", group: "intl_stocks", name: "ฮั่งเส็งรอบเช้า VIP", aliases: ["ฮั่งเส็งรอบเช้า VIP"], closeAt: "10:20", announceAt: "10:35" },
    { id: "ฮั่งเส็งพิเศษ-เช้า", group: "intl_stocks", name: "ฮั่งเส็งพิเศษ เช้า", aliases: ["ฮั่งเส็งพิเศษ เช้า"], closeAt: "10:20", announceAt: "10:35" },
    { id: "หวย-ออมสิน", group: "thai_gov", name: "หวย ออมสิน", aliases: ["หวย ออมสิน"], closeAt: "วันที่ 1 เวลา 10:30", announceAt: "14:00" },
    { id: "ฮั่งเส็งรอบเช้า", group: "intl_stocks", name: "ฮั่งเส็งรอบเช้า", aliases: ["ฮั่งเส็งรอบเช้า"], closeAt: "10:45", announceAt: "11:05" },
    { id: "หวยฮานอย-hd", group: "hanoi", name: "หวยฮานอย HD", aliases: ["หวยฮานอย HD"], closeAt: "11:00", announceAt: "11:30" },
    { id: "ฮั่งเส็ง-visa-เช้า", group: "intl_stocks", name: "ฮั่งเส็ง VISA (เช้า)", aliases: ["ฮั่งเส็ง VISA (เช้า)"], closeAt: "11:00", announceAt: "11:15" },
    { id: "แม่โขงทูเดย์", group: "laos", name: "แม่โขงทูเดย์", aliases: ["แม่โขงทูเดย์"], closeAt: "11:00", announceAt: "11:15" },
    { id: "หุ้นไต้หวัน-vip", group: "intl_stocks", name: "หุ้นไต้หวัน VIP", aliases: ["หุ้นไต้หวัน VIP"], closeAt: "11:10", announceAt: "11:35" },
    { id: "ลาวมั่งคั่ง", group: "laos", name: "ลาวมั่งคั่ง", aliases: ["ลาวมั่งคั่ง"], closeAt: "11:15", announceAt: "11:30" },
    { id: "หวยพม่า", group: "intl_stocks", name: "หวยพม่า", aliases: ["หวยพม่า"], closeAt: "11:15", announceAt: "11:30" },
    { id: "ไต้หวันพิเศษ", group: "intl_stocks", name: "ไต้หวันพิเศษ", aliases: ["ไต้หวันพิเศษ"], closeAt: "11:30", announceAt: "11:45" },
    { id: "ลาวพลัส", group: "laos", name: "ลาวพลัส", aliases: ["ลาวพลัส"], closeAt: "11:45", announceAt: "12:05" },
    { id: "หุ้นเกาหลี-vip", group: "intl_stocks", name: "หุ้นเกาหลี VIP", aliases: ["หุ้นเกาหลี VIP"], closeAt: "11:55", announceAt: "12:35" },
    { id: "หุ้นไต้หวัน", group: "intl_stocks", name: "หุ้นไต้หวัน", aliases: ["หุ้นไต้หวัน"], closeAt: "12:00", announceAt: "12:35" },
    { id: "หวยฮ่องกง-visa", group: "intl_stocks", name: "หวยฮ่องกง VISA", aliases: ["หวยฮ่องกง VISA"], closeAt: "12:00", announceAt: "12:15" },
    { id: "หวยฮานอยสตาร์", group: "hanoi", name: "หวยฮานอยสตาร์", aliases: ["หวยฮานอยสตาร์"], closeAt: "12:10", announceAt: "12:30" },
    { id: "หวยลาวพัฒนาเที่ยง", group: "laos", name: "หวยลาวพัฒนาเที่ยง", aliases: ["หวยลาวพัฒนาเที่ยง"], closeAt: "12:15", announceAt: "12:30" },
    { id: "เกาหลีพิเศษ", group: "intl_stocks", name: "เกาหลีพิเศษ", aliases: ["เกาหลีพิเศษ"], closeAt: "12:20", announceAt: "12:35" },
    { id: "นิเคอิรอบบ่าย", group: "intl_stocks", name: "นิเคอิรอบบ่าย", aliases: ["นิเคอิรอบบ่าย"], closeAt: "12:30", announceAt: "13:30" },
    { id: "นิเคอิรอบบ่าย-vip", group: "intl_stocks", name: "นิเคอิรอบบ่าย VIP", aliases: ["นิเคอิรอบบ่าย VIP"], closeAt: "13:00", announceAt: "13:30" },
    { id: "นิเคอิ-visa-บ่าย", group: "intl_stocks", name: "นิเคอิ VISA (บ่าย)", aliases: ["นิเคอิ VISA (บ่าย)"], closeAt: "13:00", announceAt: "13:15" },
    { id: "หุ้นเกาหลี", group: "intl_stocks", name: "หุ้นเกาหลี", aliases: ["หุ้นเกาหลี"], closeAt: "13:10", announceAt: "13:50" },
    { id: "นิเคอิพิเศษ-บ่าย", group: "intl_stocks", name: "นิเคอิพิเศษ บ่าย", aliases: ["นิเคอิพิเศษ บ่าย"], closeAt: "13:10", announceAt: "13:30" },
    { id: "แม่โขง-hd", group: "laos", name: "แม่โขง HD", aliases: ["แม่โขง HD"], closeAt: "13:20", announceAt: "13:35" },
    { id: "หวยลาว-hd", group: "laos", name: "หวยลาว HD", aliases: ["หวยลาว HD"], closeAt: "13:30", announceAt: "13:45" },
    { id: "หุ้นจีนรอบบ่าย", group: "intl_stocks", name: "หุ้นจีนรอบบ่าย", aliases: ["หุ้นจีนรอบบ่าย"], closeAt: "13:30", announceAt: "14:00" },
    { id: "หวยฮานอย-tv", group: "hanoi", name: "หวยฮานอย TV", aliases: ["หวยฮานอย TV"], closeAt: "14:00", announceAt: "14:30" },
    { id: "จีน-visa-บ่าย", group: "intl_stocks", name: "จีน VISA (บ่าย)", aliases: ["จีน VISA (บ่าย)"], closeAt: "14:00", announceAt: "14:15" },
    { id: "หุ้นจีนรอบบ่าย-vip", group: "intl_stocks", name: "หุ้นจีนรอบบ่าย VIP", aliases: ["หุ้นจีนรอบบ่าย VIP"], closeAt: "14:00", announceAt: "14:25" },
    { id: "จีนพิเศษ-บ่าย", group: "intl_stocks", name: "จีนพิเศษ บ่าย", aliases: ["จีนพิเศษ บ่าย"], closeAt: "14:10", announceAt: "14:25" },
    { id: "แม่โขงเมก้า", group: "laos", name: "แม่โขงเมก้า", aliases: ["แม่โขงเมก้า"], closeAt: "14:30", announceAt: "14:45" },
    { id: "ฮั่งเส็งรอบบ่าย", group: "intl_stocks", name: "ฮั่งเส็งรอบบ่าย", aliases: ["ฮั่งเส็งรอบบ่าย"], closeAt: "14:40", announceAt: "15:00" },
    { id: "ฮั่งเส็ง-visa-บ่าย", group: "intl_stocks", name: "ฮั่งเส็ง VISA (บ่าย)", aliases: ["ฮั่งเส็ง VISA (บ่าย)"], closeAt: "15:00", announceAt: "15:15" },
    { id: "ฮั่งเส็งรอบบ่าย-vip", group: "intl_stocks", name: "ฮั่งเส็งรอบบ่าย VIP", aliases: ["ฮั่งเส็งรอบบ่าย VIP"], closeAt: "15:10", announceAt: "15:30" },
    { id: "ลาวนครหลวง", group: "laos", name: "ลาวนครหลวง", aliases: ["ลาวนครหลวง"], closeAt: "15:15", announceAt: "15:30" },
    { id: "ฮั่งเส็งพิเศษ-บ่าย", group: "intl_stocks", name: "ฮั่งเส็งพิเศษ บ่าย", aliases: ["ฮั่งเส็งพิเศษ บ่าย"], closeAt: "15:15", announceAt: "15:25" },
    { id: "แม่โขงสตาร์", group: "laos", name: "แม่โขงสตาร์", aliases: ["แม่โขงสตาร์"], closeAt: "15:20", announceAt: "15:35" },
    { id: "หวยรัฐบาลไทย", group: "thai_gov", name: "หวยรัฐบาลไทย", aliases: ["หวยรัฐบาลไทย"], closeAt: "วันที่ 16 เวลา 15:25", announceAt: "16:25" },
    { id: "หวยลาวสตาร์", group: "laos", name: "หวยลาวสตาร์", aliases: ["หวยลาวสตาร์"], closeAt: "15:30", announceAt: "15:45" },
    { id: "สิงคโปร์พิเศษ", group: "intl_stocks", name: "สิงคโปร์พิเศษ", aliases: ["สิงคโปร์พิเศษ"], closeAt: "15:40", announceAt: "15:55" },
    { id: "หุ้นสิงคโปร์", group: "intl_stocks", name: "หุ้นสิงคโปร์", aliases: ["หุ้นสิงคโปร์"], closeAt: "15:55", announceAt: "16:30" },
    { id: "หวยฮานอย-visa", group: "hanoi", name: "หวยฮานอย VISA", aliases: ["หวยฮานอย VISA"], closeAt: "15:55", announceAt: "16:15" },
    { id: "หวยฮานอยกาชาด", group: "hanoi", name: "หวยฮานอยกาชาด", aliases: ["หวยฮานอยกาชาด"], closeAt: "16:00", announceAt: "16:30" },
    { id: "หวยฮานอยเฉพาะกิจ", group: "hanoi", name: "หวยฮานอยเฉพาะกิจ", aliases: ["หวยฮานอยเฉพาะกิจ"], closeAt: "16:00", announceAt: "16:30" },
    { id: "หุ้นไทยค้าง", group: "thai_stocks", name: "หุ้นไทยค้าง", aliases: ["หุ้นไทยค้าง"], closeAt: "16:10", announceAt: "16:30" },
    { id: "หวยฮานอยดานัง", group: "hanoi", name: "หวยฮานอยดานัง", aliases: ["หวยฮานอยดานัง"], closeAt: "16:15", announceAt: "16:30" },
    { id: "หุ้นสิงคโปร์-vip", group: "intl_stocks", name: "หุ้นสิงคโปร์ VIP", aliases: ["หุ้นสิงคโปร์ VIP"], closeAt: "16:20", announceAt: "17:05" },
    { id: "เวียดนามพิเศษ-บ่าย", group: "hanoi", name: "เวียดนามพิเศษ บ่าย", aliases: ["เวียดนามพิเศษ บ่าย"], closeAt: "16:20", announceAt: "16:35" },
    { id: "แม่โขงพลัส", group: "laos", name: "แม่โขงพลัส", aliases: ["แม่โขงพลัส"], closeAt: "16:25", announceAt: "16:40" },
    { id: "หุ้นไทยเย็น", group: "thai_stocks", name: "หุ้นไทยเย็น", aliases: ["หุ้นไทยเย็น"], closeAt: "16:30", announceAt: "16:50" },
    { id: "หุ้นอินเดีย", group: "intl_stocks", name: "หุ้นอินเดีย", aliases: ["หุ้นอินเดีย"], closeAt: "16:40", announceAt: "17:30" },
    { id: "หวยฮานอยพิเศษ", group: "hanoi", name: "หวยฮานอยพิเศษ", aliases: ["หวยฮานอยพิเศษ"], closeAt: "17:00", announceAt: "17:30" },
    { id: "แม่โขงพิเศษ", group: "laos", name: "แม่โขงพิเศษ", aliases: ["แม่โขงพิเศษ"], closeAt: "17:10", announceAt: "17:25" },
    { id: "ฮานอยสามัคคี", group: "hanoi", name: "ฮานอยสามัคคี", aliases: ["ฮานอยสามัคคี"], closeAt: "17:15", announceAt: "17:30" },
    { id: "หวยมาเลย์", group: "intl_stocks", name: "หวยมาเลย์", aliases: ["หวยมาเลย์"], closeAt: "18:00", announceAt: "18:30" },
    { id: "หวยฮานอยปกติ", group: "hanoi", name: "หวยฮานอยปกติ", aliases: ["หวยฮานอยปกติ"], closeAt: "18:10", announceAt: "18:30" },
    { id: "แม่โขงปกติ", group: "laos", name: "แม่โขงปกติ", aliases: ["แม่โขงปกติ"], closeAt: "18:10", announceAt: "18:25" },
    { id: "หวยเวียดนามปกติ-ออนไลน์", group: "hanoi", name: "หวยเวียดนามปกติ ออนไลน์", aliases: ["หวยเวียดนามปกติ ออนไลน์"], closeAt: "18:10", announceAt: "18:30" },
    { id: "หวยลาว-super", group: "laos", name: "หวยลาว Super", aliases: ["หวยลาว Super"], closeAt: "18:30", announceAt: "19:00" },
    { id: "หวยฮานอยพัฒนา", group: "hanoi", name: "หวยฮานอยพัฒนา", aliases: ["หวยฮานอยพัฒนา"], closeAt: "19:10", announceAt: "19:30" },
    { id: "หวยฮานอย-vip", group: "hanoi", name: "หวยฮานอย VIP", aliases: ["หวยฮานอย VIP"], closeAt: "19:10", announceAt: "19:30" },
    { id: "หวยเวียดนามvip-ออนไลน์", group: "hanoi", name: "หวยเวียดนามVIP ออนไลน์", aliases: ["หวยเวียดนามVIP ออนไลน์"], closeAt: "19:10", announceAt: "19:30" },
    { id: "แม่โขง-vip", group: "laos", name: "แม่โขง VIP", aliases: ["แม่โขง VIP"], closeAt: "19:30", announceAt: "19:45" },
    { id: "หวยลาวพิเศษ", group: "laos", name: "หวยลาวพิเศษ", aliases: ["หวยลาวพิเศษ"], closeAt: "19:45", announceAt: "20:00" },
    { id: "หวยลาวพัฒนา", group: "laos", name: "หวยลาวพัฒนา", aliases: ["หวยลาวพัฒนา"], closeAt: "20:10", announceAt: "20:25" },
    { id: "หวยลาวสามัคคี", group: "laos", name: "หวยลาวสามัคคี", aliases: ["หวยลาวสามัคคี"], closeAt: "20:10", announceAt: "20:30" },
    { id: "หวยลาวอาเซียน", group: "laos", name: "หวยลาวอาเซียน", aliases: ["หวยลาวอาเซียน"], closeAt: "20:40", announceAt: "21:00" },
    { id: "หวยฮานอย-4d", group: "hanoi", name: "หวยฮานอย 4D", aliases: ["หวยฮานอย 4D"], closeAt: "20:40", announceAt: "21:00" },
    { id: "อังกฤษ-visa", group: "intl_stocks", name: "อังกฤษ VISA", aliases: ["อังกฤษ VISA"], closeAt: "21:00", announceAt: "21:15" },
    { id: "แม่โขงพัฒนา", group: "laos", name: "แม่โขงพัฒนา", aliases: ["แม่โขงพัฒนา"], closeAt: "21:00", announceAt: "21:15" },
    { id: "ลาวสามัคคี-vip", group: "laos", name: "ลาวสามัคคี VIP", aliases: ["ลาวสามัคคี VIP"], closeAt: "21:05", announceAt: "21:30" },
    { id: "หวยลาว-vip", group: "laos", name: "หวยลาว VIP", aliases: ["หวยลาว VIP"], closeAt: "21:10", announceAt: "21:30" },
    { id: "หุ้นอังกฤษ-vip", group: "intl_stocks", name: "หุ้นอังกฤษ VIP", aliases: ["หุ้นอังกฤษ VIP"], closeAt: "21:10", announceAt: "21:50" },
    { id: "หวยลาวรุ่งเรือง", group: "laos", name: "หวยลาวรุ่งเรือง", aliases: ["หวยลาวรุ่งเรือง"], closeAt: "21:15", announceAt: "21:30" },
    { id: "หวยลาวสตาร์-vip", group: "laos", name: "หวยลาวสตาร์ VIP", aliases: ["หวยลาวสตาร์ VIP"], closeAt: "21:30", announceAt: "22:00" },
    { id: "ฮานอยดึก", group: "hanoi", name: "ฮานอยดึก", aliases: ["ฮานอยดึก"], closeAt: "22:00", announceAt: "22:30" },
    { id: "หวยฮานอย-extra", group: "hanoi", name: "หวยฮานอย EXTRA", aliases: ["หวยฮานอย EXTRA"], closeAt: "22:00", announceAt: "22:30" },
    { id: "เยอรมัน-visa", group: "intl_stocks", name: "เยอรมัน VISA", aliases: ["เยอรมัน VISA"], closeAt: "22:00", announceAt: "23:55" },
    { id: "รัสเซียพิเศษ", group: "intl_stocks", name: "รัสเซียพิเศษ", aliases: ["รัสเซียพิเศษ"], closeAt: "22:10", announceAt: "22:25" },
    { id: "หุ้นเยอรมัน", group: "intl_stocks", name: "หุ้นเยอรมัน", aliases: ["หุ้นเยอรมัน"], closeAt: "22:15", announceAt: "23:55" },
    { id: "หุ้นอังกฤษ", group: "intl_stocks", name: "หุ้นอังกฤษ", aliases: ["หุ้นอังกฤษ"], closeAt: "22:20", announceAt: "23:55" },
    { id: "หุ้นเยอรมัน-vip", group: "intl_stocks", name: "หุ้นเยอรมัน VIP", aliases: ["หุ้นเยอรมัน VIP"], closeAt: "22:30", announceAt: "22:50" },
    { id: "หุ้นรัสเซีย", group: "intl_stocks", name: "หุ้นรัสเซีย", aliases: ["หุ้นรัสเซีย"], closeAt: "22:30", announceAt: "23:00" },
    { id: "แม่โขงโกลด์", group: "laos", name: "แม่โขงโกลด์", aliases: ["แม่โขงโกลด์"], closeAt: "22:30", announceAt: "22:45" },
    { id: "หวยลาวกาชาด", group: "laos", name: "หวยลาวกาชาด", aliases: ["หวยลาวกาชาด"], closeAt: "23:00", announceAt: "23:30" },
    { id: "รัสเซีย-visa", group: "intl_stocks", name: "รัสเซีย VISA", aliases: ["รัสเซีย VISA"], closeAt: "23:00", announceAt: "23:15" },
    { id: "อังกฤษพิเศษ", group: "intl_stocks", name: "อังกฤษพิเศษ", aliases: ["อังกฤษพิเศษ"], closeAt: "23:00", announceAt: "23:15" },
    { id: "เยอรมันพิเศษ", group: "intl_stocks", name: "เยอรมันพิเศษ", aliases: ["เยอรมันพิเศษ"], closeAt: "23:00", announceAt: "23:15" },
    { id: "หุ้นยูโร", group: "intl_stocks", name: "หุ้นยูโร", aliases: ["หุ้นยูโร"], closeAt: "23:10", announceAt: "23:30" },
    { id: "ลาวไอยรา", group: "laos", name: "ลาวไอยรา", aliases: ["ลาวไอยรา"], closeAt: "23:15", announceAt: "23:30" },
    { id: "ดาวโจนส์พิเศษ", group: "intl_stocks", name: "ดาวโจนส์พิเศษ", aliases: ["ดาวโจนส์พิเศษ"], closeAt: "23:15", announceAt: "23:30" },
    { id: "ดาวโจนส์-vip-พิเศษ", group: "intl_stocks", name: "ดาวโจนส์ VIP พิเศษ", aliases: ["ดาวโจนส์ VIP พิเศษ"], closeAt: "23:15", announceAt: "23:30" },
    { id: "หุ้นรัสเชีย-vip", group: "intl_stocks", name: "หุ้นรัสเชีย VIP", aliases: ["หุ้นรัสเชีย VIP"], closeAt: "23:20", announceAt: "23:50" },
    { id: "หวยแคนาดา", group: "intl_stocks", name: "หวยแคนาดา", aliases: ["หวยแคนาดา"], closeAt: "23:30", announceAt: "00:05" },
    { id: "แม่โขงไนท์", group: "laos", name: "แม่โขงไนท์", aliases: ["แม่โขงไนท์"], closeAt: "23:30", announceAt: "23:45" },
    { id: "หวยดาวโจนส์อเมริกา", group: "intl_stocks", name: "หวยดาวโจนส์อเมริกา", aliases: ["หวยดาวโจนส์อเมริกา"], closeAt: "23:55", announceAt: "00:30" },
    { id: "หุ้นดาวโจนส์-vip", group: "intl_stocks", name: "หุ้นดาวโจนส์ VIP", aliases: ["หุ้นดาวโจนส์ VIP"], closeAt: "00:00", announceAt: "00:30" },
    { id: "หวยดาวโจนส์-visa", group: "intl_stocks", name: "หวยดาวโจนส์ VISA", aliases: ["หวยดาวโจนส์ VISA"], closeAt: "00:00", announceAt: "00:15" },
    { id: "หุ้นดาวโจนส์", group: "intl_stocks", name: "หุ้นดาวโจนส์", aliases: ["หุ้นดาวโจนส์"], closeAt: "01:00", announceAt: "03:15" },
    { id: "หุ้นดาวโจนส์-star", group: "intl_stocks", name: "หุ้นดาวโจนส์ STAR", aliases: ["หุ้นดาวโจนส์ STAR"], closeAt: "01:00", announceAt: "01:30" },
  ];
  
  export function formatDrawList(items: DrawTime[]): string {
    if (!items.length) return "ยังไม่พบรายการเวลาที่ตรงกับคำค้นค่ะ";
    const lines = items.map((i) => {
      const when = [
        i.closeAt ? `ปิดรับ ${i.closeAt}` : null,
        i.announceAt ? `ออกผล ${i.announceAt}` : null,
      ].filter(Boolean).join(" • ");
      const note = i.note ? ` (${i.note})` : "";
      return `• ${i.name}${when ? ` — ${when}` : ""}${note}`;
    });
    return ["⏰ ตารางเวลา", ...lines].join("\n");
  }
  
  export function findTimesByText(text: string): DrawTime[] {
    const t = (text || "").toLowerCase();
  
    if (/(ทั้งหมด|ตาราง|เวลาออกผลทั้งหมด|ดูเวลาทั้งหมด)/i.test(t)) {
      return DRAW_TIMES.filter(x =>
        ["laos","hanoi","thai_stocks","intl_stocks","thai_gov","yeekee","others"].includes(x.group)
      );
    }
  
    if (/(ลาว|lao)/i.test(t))       return DRAW_TIMES.filter(x => x.group === "laos");
    if (/(ฮานอย|hn|hanoi)/i.test(t))return DRAW_TIMES.filter(x => x.group === "hanoi");
    if (/(หุ้นไทย|set)/i.test(t))   return DRAW_TIMES.filter(x => x.group === "thai_stocks");
    if (/(รัฐบาล|สลาก)/i.test(t))   return DRAW_TIMES.filter(x => x.group === "thai_gov");
    if (/(ยี่กี|yeekee)/i.test(t))   return DRAW_TIMES.filter(x => x.group === "yeekee");
    if (/(หุ้นต่างประเทศ|นิเคอิ|ฮั่งเส็ง|ดาวโจนส์|จีน|เกาหลี|ไต้หวัน|สิงคโปร์|taiwan|nikkei|hang\s*seng|dow)/i.test(t))
      return DRAW_TIMES.filter(x => x.group === "intl_stocks");
  
    const hitAlias = DRAW_TIMES.filter(x =>
      x.aliases.some(a => t.includes(a.toLowerCase()))
    );
    if (hitAlias.length) return hitAlias;
  
    return [];
  }
  