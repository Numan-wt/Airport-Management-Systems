
// ============================================================
// AeroNexus — Mock Data Layer
// ============================================================
function offsetTime(baseHour, baseMin, offsetMin = 0) {
  const d = new Date();
  d.setHours(baseHour, baseMin + offsetMin, 0, 0);
  return d.toISOString();
}

const AIRLINES = {
  '6E': { name: 'IndiGo',              color: '#4f8ef7', bg: '#4f8ef720' },
  'AI': { name: 'Air India',           color: '#ef4444', bg: '#ef444420' },
  'SG': { name: 'SpiceJet',            color: '#f97316', bg: '#f9731620' },
  'UK': { name: 'Vistara',             color: '#a855f7', bg: '#a855f720' },
  'EK': { name: 'Emirates',            color: '#f59e0b', bg: '#f59e0b20' },
  'QR': { name: 'Qatar Airways',       color: '#be123c', bg: '#be123c20' },
  'SQ': { name: 'Singapore Airlines',  color: '#06b6d4', bg: '#06b6d420' },
  'BA': { name: 'British Airways',     color: '#1e40af', bg: '#1e40af20' },
};

const AIRPORTS_DB = {
  DEL: { name: 'Indira Gandhi Intl',          city: 'New Delhi'  },
  BOM: { name: 'Chhatrapati Shivaji Intl',    city: 'Mumbai'     },
  BLR: { name: 'Kempegowda Intl',             city: 'Bangalore'  },
  MAA: { name: 'Chennai Intl',                city: 'Chennai'    },
  HYD: { name: 'Rajiv Gandhi Intl',           city: 'Hyderabad'  },
  CCU: { name: 'Netaji Subhas Chandra Bose',  city: 'Kolkata'    },
  DXB: { name: 'Dubai Intl',                  city: 'Dubai'      },
  LHR: { name: 'London Heathrow',             city: 'London'     },
  SIN: { name: 'Changi Airport',              city: 'Singapore'  },
  JFK: { name: 'JFK Intl',                   city: 'New York'   },
};

const MOCK_FLIGHTS = [
  { id:'FL001', flightNumber:'6E-345',  airlineCode:'6E', type:'Departure', origin:'DEL', destination:'BOM', scheduledDep: offsetTime(5,0),  scheduledArr: offsetTime(7,0),  status:'Departed',   gate:'A3', terminal:'T1', aircraft:'Airbus A320',  capacity:180, checkedIn:172, boarded:172, delayMinutes:0,   delayReason:null },
  { id:'FL002', flightNumber:'AI-202',  airlineCode:'AI', type:'Departure', origin:'DEL', destination:'LHR', scheduledDep: offsetTime(6,15), scheduledArr: offsetTime(11,45),status:'Departed',   gate:'C2', terminal:'T3', aircraft:'Boeing 787',   capacity:280, checkedIn:265, boarded:265, delayMinutes:0,   delayReason:null },
  { id:'FL003', flightNumber:'6E-789',  airlineCode:'6E', type:'Departure', origin:'DEL', destination:'BLR', scheduledDep: offsetTime(7,30), scheduledArr: offsetTime(9,45), status:'Boarding',   gate:'A5', terminal:'T1', aircraft:'Airbus A320',  capacity:180, checkedIn:168, boarded:120, delayMinutes:0,   delayReason:null },
  { id:'FL004', flightNumber:'SG-112',  airlineCode:'SG', type:'Departure', origin:'DEL', destination:'CCU', scheduledDep: offsetTime(8,0),  scheduledArr: offsetTime(10,15),status:'Delayed',    gate:'B2', terminal:'T1', aircraft:'Boeing 737',   capacity:162, checkedIn:140, boarded:0,   delayMinutes:45,  delayReason:'Weather' },
  { id:'FL005', flightNumber:'UK-831',  airlineCode:'UK', type:'Departure', origin:'DEL', destination:'BOM', scheduledDep: offsetTime(8,45), scheduledArr: offsetTime(10,45),status:'On Time',    gate:'B4', terminal:'T2', aircraft:'Airbus A320',  capacity:180, checkedIn:95,  boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL006', flightNumber:'EK-509',  airlineCode:'EK', type:'Departure', origin:'DEL', destination:'DXB', scheduledDep: offsetTime(9,30), scheduledArr: offsetTime(12,0), status:'On Time',    gate:'C4', terminal:'T3', aircraft:'Boeing 777',   capacity:354, checkedIn:310, boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL007', flightNumber:'AI-440',  airlineCode:'AI', type:'Departure', origin:'DEL', destination:'MAA', scheduledDep: offsetTime(10,0), scheduledArr: offsetTime(12,30),status:'On Time',    gate:'A1', terminal:'T1', aircraft:'Airbus A321',  capacity:196, checkedIn:142, boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL008', flightNumber:'QR-571',  airlineCode:'QR', type:'Departure', origin:'DEL', destination:'DOH', scheduledDep: offsetTime(11,15),scheduledArr: offsetTime(13,30),status:'On Time',    gate:'C6', terminal:'T3', aircraft:'Boeing 787',   capacity:280, checkedIn:240, boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL009', flightNumber:'6E-622',  airlineCode:'6E', type:'Departure', origin:'DEL', destination:'HYD', scheduledDep: offsetTime(12,0), scheduledArr: offsetTime(14,15),status:'On Time',    gate:'A7', terminal:'T1', aircraft:'Airbus A320',  capacity:180, checkedIn:88,  boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL010', flightNumber:'SQ-404',  airlineCode:'SQ', type:'Departure', origin:'DEL', destination:'SIN', scheduledDep: offsetTime(13,30),scheduledArr: offsetTime(22,0), status:'Scheduled',  gate:'C8', terminal:'T3', aircraft:'Airbus A380',  capacity:471, checkedIn:390, boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL011', flightNumber:'BA-143',  airlineCode:'BA', type:'Departure', origin:'DEL', destination:'LHR', scheduledDep: offsetTime(14,45),scheduledArr: offsetTime(20,15),status:'Scheduled',  gate:'C1', terminal:'T3', aircraft:'Boeing 777',   capacity:295, checkedIn:188, boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL012', flightNumber:'SG-441',  airlineCode:'SG', type:'Departure', origin:'DEL', destination:'BOM', scheduledDep: offsetTime(15,30),scheduledArr: offsetTime(17,30),status:'Scheduled',  gate:'B1', terminal:'T1', aircraft:'Boeing 737',   capacity:162, checkedIn:65,  boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL013', flightNumber:'6E-990',  airlineCode:'6E', type:'Departure', origin:'DEL', destination:'BLR', scheduledDep: offsetTime(16,0), scheduledArr: offsetTime(18,15),status:'Delayed',    gate:'A9', terminal:'T1', aircraft:'Airbus A320',  capacity:180, checkedIn:32,  boarded:0,   delayMinutes:30,  delayReason:'ATC Hold' },
  { id:'FL014', flightNumber:'UK-955',  airlineCode:'UK', type:'Departure', origin:'DEL', destination:'HYD', scheduledDep: offsetTime(17,15),scheduledArr: offsetTime(19,30),status:'Scheduled',  gate:'B6', terminal:'T2', aircraft:'Airbus A321',  capacity:196, checkedIn:44,  boarded:0,   delayMinutes:0,   delayReason:null },
  { id:'FL015', flightNumber:'EK-511',  airlineCode:'EK', type:'Departure', origin:'DEL', destination:'DXB', scheduledDep: offsetTime(20,0), scheduledArr: offsetTime(22,30),status:'Scheduled',  gate:'C3', terminal:'T3', aircraft:'Boeing 777',   capacity:354, checkedIn:0,   boarded:0,   delayMinutes:0,   delayReason:null },

  // Arrivals
  { id:'FL016', flightNumber:'6E-346',  airlineCode:'6E', type:'Arrival',   origin:'BOM', destination:'DEL', scheduledDep: offsetTime(4,30), scheduledArr: offsetTime(6,30), status:'Landed',     gate:'A4', terminal:'T1', aircraft:'Airbus A320',  capacity:180, checkedIn:180, boarded:180, delayMinutes:0,   delayReason:null },
  { id:'FL017', flightNumber:'EK-510',  airlineCode:'EK', type:'Arrival',   origin:'DXB', destination:'DEL', scheduledDep: offsetTime(3,0),  scheduledArr: offsetTime(7,0),  status:'Landed',     gate:'C5', terminal:'T3', aircraft:'Boeing 777',   capacity:354, checkedIn:354, boarded:354, delayMinutes:0,   delayReason:null },
  { id:'FL018', flightNumber:'AI-203',  airlineCode:'AI', type:'Arrival',   origin:'LHR', destination:'DEL', scheduledDep: offsetTime(0,30), scheduledArr: offsetTime(12,0), status:'On Time',    gate:'C7', terminal:'T3', aircraft:'Boeing 787',   capacity:280, checkedIn:280, boarded:280, delayMinutes:0,   delayReason:null },
  { id:'FL019', flightNumber:'SQ-403',  airlineCode:'SQ', type:'Arrival',   origin:'SIN', destination:'DEL', scheduledDep: offsetTime(1,0),  scheduledArr: offsetTime(8,0),  status:'Delayed',    gate:'C9', terminal:'T3', aircraft:'Airbus A380',  capacity:471, checkedIn:471, boarded:471, delayMinutes:20,  delayReason:'Slot Delay' },
  { id:'FL020', flightNumber:'BA-142',  airlineCode:'BA', type:'Arrival',   origin:'LHR', destination:'DEL', scheduledDep: offsetTime(2,0),  scheduledArr: offsetTime(14,30),status:'Scheduled',  gate:'C2', terminal:'T3', aircraft:'Boeing 777',   capacity:295, checkedIn:295, boarded:295, delayMinutes:0,   delayReason:null },
];

const MOCK_PASSENGERS = [
  { id:'PAX001', bookingId:'BK-8821', name:'Rahul Sharma',    email:'rahul.sharma@email.com',    phone:'+91 9876543210', flightId:'FL003', seat:'12A', seatClass:'Economy',  checkedIn:true,  boarded:true,  baggage:15, specialAssistance:false, nationality:'Indian',    passport:'K1234567' },
  { id:'PAX002', bookingId:'BK-8822', name:'Priya Mehta',     email:'priya.mehta@email.com',     phone:'+91 9812345678', flightId:'FL003', seat:'14C', seatClass:'Economy',  checkedIn:true,  boarded:false, baggage:20, specialAssistance:false, nationality:'Indian',    passport:'L2345678' },
  { id:'PAX003', bookingId:'BK-8823', name:'Arjun Singh',     email:'arjun.singh@email.com',     phone:'+91 9823456789', flightId:'FL004', seat:'5A',  seatClass:'Business', checkedIn:true,  boarded:false, baggage:30, specialAssistance:false, nationality:'Indian',    passport:'M3456789' },
  { id:'PAX004', bookingId:'BK-8824', name:'Ananya Patel',    email:'ananya.p@email.com',        phone:'+91 9834567890', flightId:'FL005', seat:'22B', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:15, specialAssistance:false, nationality:'Indian',    passport:'N4567890' },
  { id:'PAX005', bookingId:'BK-8825', name:'Vikram Nair',     email:'vikram.n@email.com',        phone:'+91 9845678901', flightId:'FL006', seat:'3A',  seatClass:'First',    checkedIn:true,  boarded:false, baggage:40, specialAssistance:false, nationality:'Indian',    passport:'O5678901' },
  { id:'PAX006', bookingId:'BK-8826', name:'Meera Joshi',     email:'meera.j@email.com',         phone:'+91 9856789012', flightId:'FL006', seat:'8F',  seatClass:'Business', checkedIn:true,  boarded:false, baggage:30, specialAssistance:true,  nationality:'Indian',    passport:'P6789012' },
  { id:'PAX007', bookingId:'BK-8827', name:'Rohan Das',       email:'rohan.d@email.com',         phone:'+91 9867890123', flightId:'FL007', seat:'16D', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:15, specialAssistance:false, nationality:'Indian',    passport:'Q7890123' },
  { id:'PAX008', bookingId:'BK-8828', name:'Kavya Reddy',     email:'kavya.r@email.com',         phone:'+91 9878901234', flightId:'FL007', seat:'18E', seatClass:'Economy',  checkedIn:true,  boarded:false, baggage:20, specialAssistance:false, nationality:'Indian',    passport:'R8901234' },
  { id:'PAX009', bookingId:'BK-8829', name:'Aditya Kumar',    email:'aditya.k@email.com',        phone:'+91 9889012345', flightId:'FL008', seat:'2B',  seatClass:'Business', checkedIn:true,  boarded:false, baggage:30, specialAssistance:false, nationality:'Indian',    passport:'S9012345' },
  { id:'PAX010', bookingId:'BK-8830', name:'Sanya Kapoor',    email:'sanya.k@email.com',         phone:'+91 9890123456', flightId:'FL009', seat:'25A', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:15, specialAssistance:false, nationality:'Indian',    passport:'T0123456' },
  { id:'PAX011', bookingId:'BK-8831', name:'James Miller',    email:'j.miller@email.com',        phone:'+44 7911123456', flightId:'FL010', seat:'1A',  seatClass:'First',    checkedIn:true,  boarded:false, baggage:50, specialAssistance:false, nationality:'British',   passport:'UK123456' },
  { id:'PAX012', bookingId:'BK-8832', name:'Emma Wilson',     email:'emma.w@email.com',          phone:'+44 7922234567', flightId:'FL011', seat:'7C',  seatClass:'Business', checkedIn:true,  boarded:false, baggage:30, specialAssistance:false, nationality:'British',   passport:'UK234567' },
  { id:'PAX013', bookingId:'BK-8833', name:'Mohammed Al-Ali', email:'m.alali@email.com',         phone:'+971 501234567', flightId:'FL006', seat:'15B', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:20, specialAssistance:false, nationality:'Emirati',   passport:'UAE12345' },
  { id:'PAX014', bookingId:'BK-8834', name:'Sunita Rao',      email:'sunita.r@email.com',        phone:'+91 9901234567', flightId:'FL012', seat:'10A', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:15, specialAssistance:false, nationality:'Indian',    passport:'U1234567' },
  { id:'PAX015', bookingId:'BK-8835', name:'Deepak Verma',    email:'deepak.v@email.com',        phone:'+91 9912345678', flightId:'FL013', seat:'20C', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:15, specialAssistance:false, nationality:'Indian',    passport:'V2345678' },
  { id:'PAX016', bookingId:'BK-8836', name:'Neha Gupta',      email:'neha.g@email.com',          phone:'+91 9923456789', flightId:'FL014', seat:'11F', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:20, specialAssistance:false, nationality:'Indian',    passport:'W3456789' },
  { id:'PAX017', bookingId:'BK-8837', name:'Rajesh Agarwal',  email:'rajesh.a@email.com',        phone:'+91 9934567890', flightId:'FL005', seat:'4C',  seatClass:'Business', checkedIn:true,  boarded:false, baggage:30, specialAssistance:false, nationality:'Indian',    passport:'X4567890' },
  { id:'PAX018', bookingId:'BK-8838', name:'Pooja Iyer',      email:'pooja.i@email.com',         phone:'+91 9945678901', flightId:'FL009', seat:'30B', seatClass:'Economy',  checkedIn:false, boarded:false, baggage:15, specialAssistance:true,  nationality:'Indian',    passport:'Y5678901' },
  { id:'PAX019', bookingId:'BK-8839', name:'Carlos Mendes',   email:'c.mendes@email.com',        phone:'+55 11987654321',flightId:'FL010', seat:'2C',  seatClass:'First',    checkedIn:true,  boarded:false, baggage:50, specialAssistance:false, nationality:'Brazilian', passport:'BR123456' },
  { id:'PAX020', bookingId:'BK-8840', name:'Li Wei',          email:'li.wei@email.com',          phone:'+86 13812345678',flightId:'FL010', seat:'10D', seatClass:'Business', checkedIn:true,  boarded:false, baggage:30, specialAssistance:false, nationality:'Chinese',   passport:'CN123456' },
];

const MOCK_STAFF = [
  { id:'ST001', name:'Priya Mehta',     role:'Supervisor',       dept:'Ground Ops',   shift:'Morning', gate:'A3', status:'On Duty',  performance:96, experience:'5 years',  phone:'+91 9811001100', email:'priya.m@aeronexus.com' },
  { id:'ST002', name:'Raj Kumar',       role:'Check-in Agent',   dept:'Ground Ops',   shift:'Morning', gate:'A5', status:'On Duty',  performance:89, experience:'3 years',  phone:'+91 9811002200', email:'raj.k@aeronexus.com' },
  { id:'ST003', name:'Sneha Pillai',    role:'Check-in Agent',   dept:'Ground Ops',   shift:'Morning', gate:'B2', status:'On Duty',  performance:92, experience:'2 years',  phone:'+91 9811003300', email:'sneha.p@aeronexus.com' },
  { id:'ST004', name:'Amit Tiwari',     role:'Security Officer', dept:'Security',     shift:'Morning', gate:'C1', status:'On Duty',  performance:95, experience:'7 years',  phone:'+91 9811004400', email:'amit.t@aeronexus.com' },
  { id:'ST005', name:'Divya Sharma',    role:'Gate Agent',       dept:'Ground Ops',   shift:'Morning', gate:'C4', status:'On Duty',  performance:88, experience:'1 year',   phone:'+91 9811005500', email:'divya.s@aeronexus.com' },
  { id:'ST006', name:'Karan Malhotra',  role:'Baggage Handler',  dept:'Baggage',      shift:'Morning', gate:'A1', status:'On Duty',  performance:91, experience:'4 years',  phone:'+91 9811006600', email:'karan.m@aeronexus.com' },
  { id:'ST007', name:'Anita Desai',     role:'Supervisor',       dept:'Passenger Svc',shift:'Evening', gate:'B4', status:'Off Duty', performance:94, experience:'8 years',  phone:'+91 9811007700', email:'anita.d@aeronexus.com' },
  { id:'ST008', name:'Suresh Nair',     role:'Check-in Agent',   dept:'Ground Ops',   shift:'Evening', gate:'A7', status:'Off Duty', performance:85, experience:'2 years',  phone:'+91 9811008800', email:'suresh.n@aeronexus.com' },
  { id:'ST009', name:'Meenal Jain',     role:'Security Officer', dept:'Security',     shift:'Evening', gate:'C6', status:'Off Duty', performance:93, experience:'6 years',  phone:'+91 9811009900', email:'meenal.j@aeronexus.com' },
  { id:'ST010', name:'Ravi Chandra',    role:'Gate Agent',       dept:'Ground Ops',   shift:'Night',   gate:'C8', status:'Off Duty', performance:87, experience:'3 years',  phone:'+91 9811010100', email:'ravi.c@aeronexus.com' },
  { id:'ST011', name:'Kavitha Menon',   role:'Baggage Handler',  dept:'Baggage',      shift:'Night',   gate:'B6', status:'Off Duty', performance:90, experience:'5 years',  phone:'+91 9811011100', email:'kavitha.m@aeronexus.com' },
  { id:'ST012', name:'Vikash Pandey',   role:'Admin',            dept:'Administration',shift:'Morning',gate:'-',  status:'On Duty',  performance:97, experience:'10 years', phone:'+91 9811012100', email:'vikash.p@aeronexus.com' },
  { id:'ST013', name:'Pooja Saxena',    role:'Customer Service', dept:'Passenger Svc',shift:'Morning', gate:'A9', status:'On Duty',  performance:91, experience:'4 years',  phone:'+91 9811013100', email:'pooja.s@aeronexus.com' },
  { id:'ST014', name:'Dinesh Gupta',    role:'Security Officer', dept:'Security',     shift:'Morning', gate:'T3', status:'On Duty',  performance:94, experience:'9 years',  phone:'+91 9811014100', email:'dinesh.g@aeronexus.com' },
  { id:'ST015', name:'Lakshmi Rao',     role:'Check-in Agent',   dept:'Ground Ops',   shift:'Evening', gate:'C2', status:'Off Duty', performance:88, experience:'2 years',  phone:'+91 9811015100', email:'lakshmi.r@aeronexus.com' },
];

const MOCK_GATES = [
  { id:'A1', terminal:'T1', section:'A', status:'Available',   type:'Domestic',       capacity:'Narrow Body', assignedFlight:null,   assignedStaff:['ST006'] },
  { id:'A3', terminal:'T1', section:'A', status:'Occupied',    type:'Domestic',       capacity:'Narrow Body', assignedFlight:'FL001',assignedStaff:['ST001'] },
  { id:'A4', terminal:'T1', section:'A', status:'Occupied',    type:'Domestic',       capacity:'Narrow Body', assignedFlight:'FL016',assignedStaff:[] },
  { id:'A5', terminal:'T1', section:'A', status:'Occupied',    type:'Domestic',       capacity:'Narrow Body', assignedFlight:'FL003',assignedStaff:['ST002'] },
  { id:'A7', terminal:'T1', section:'A', status:'Available',   type:'Domestic',       capacity:'Narrow Body', assignedFlight:null,   assignedStaff:['ST008'] },
  { id:'A9', terminal:'T1', section:'A', status:'Maintenance', type:'Domestic',       capacity:'Narrow Body', assignedFlight:null,   assignedStaff:[] },
  { id:'B1', terminal:'T1', section:'B', status:'Available',   type:'Domestic',       capacity:'Narrow Body', assignedFlight:null,   assignedStaff:[] },
  { id:'B2', terminal:'T1', section:'B', status:'Occupied',    type:'Domestic',       capacity:'Narrow Body', assignedFlight:'FL004',assignedStaff:['ST003'] },
  { id:'B4', terminal:'T2', section:'B', status:'Occupied',    type:'Domestic',       capacity:'Narrow Body', assignedFlight:'FL005',assignedStaff:['ST007'] },
  { id:'B6', terminal:'T2', section:'B', status:'Available',   type:'Domestic',       capacity:'Narrow Body', assignedFlight:null,   assignedStaff:['ST011'] },
  { id:'C1', terminal:'T3', section:'C', status:'Available',   type:'International',  capacity:'Wide Body',   assignedFlight:null,   assignedStaff:['ST004'] },
  { id:'C2', terminal:'T3', section:'C', status:'Occupied',    type:'International',  capacity:'Wide Body',   assignedFlight:'FL002',assignedStaff:['ST015'] },
  { id:'C3', terminal:'T3', section:'C', status:'Available',   type:'International',  capacity:'Wide Body',   assignedFlight:null,   assignedStaff:[] },
  { id:'C4', terminal:'T3', section:'C', status:'Occupied',    type:'International',  capacity:'Wide Body',   assignedFlight:'FL006',assignedStaff:['ST005'] },
  { id:'C5', terminal:'T3', section:'C', status:'Occupied',    type:'International',  capacity:'Wide Body',   assignedFlight:'FL017',assignedStaff:[] },
  { id:'C6', terminal:'T3', section:'C', status:'Occupied',    type:'International',  capacity:'Wide Body',   assignedFlight:'FL008',assignedStaff:['ST009'] },
  { id:'C7', terminal:'T3', section:'C', status:'Available',   type:'International',  capacity:'Wide Body',   assignedFlight:null,   assignedStaff:[] },
  { id:'C8', terminal:'T3', section:'C', status:'Occupied',    type:'International',  capacity:'Wide Body',   assignedFlight:'FL010',assignedStaff:['ST010'] },
  { id:'C9', terminal:'T3', section:'C', status:'Occupied',    type:'International',  capacity:'Wide Body',   assignedFlight:'FL019',assignedStaff:[] },
  { id:'C10',terminal:'T3', section:'C', status:'Closed',      type:'International',  capacity:'Wide Body',   assignedFlight:null,   assignedStaff:[] },
];

// Airline historical delay rates (0–1)
const DELAY_RATES = { '6E':0.18,'AI':0.28,'SG':0.22,'UK':0.15,'EK':0.08,'QR':0.06,'SQ':0.05,'BA':0.12 };

// Weather data (mock)
const MOCK_WEATHER = { temp:32, condition:'Partly Cloudy', wind:18, visibility:8, humidity:55, delayRisk:'Low' };
