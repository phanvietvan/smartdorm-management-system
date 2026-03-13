require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const permissionsMw = require('./middleware/permissions');
const { hasAnyPermission, ROLES, PERMISSIONS } = require('./config/roles');

async function debug() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smartdorm');
  const user = await User.findOne({ role: 'admin' });
  console.log("DB User Role:", user.role);

  console.log("PERMISSIONS.BILLS_CREATE =", PERMISSIONS.BILLS_CREATE);

  // simulate mw
  const middleware = permissionsMw.requirePermission(PERMISSIONS.BILLS_CREATE);
  
  const req = { user: user };
  const res = {
    status: (code) => {
      console.log("RES.STATUS CALL:", code);
      return {
        json: (data) => { console.log("RES.JSON CALL:", data); }
      }
    }
  };
  const next = () => {
    console.log("NEXT CALLED!");
  }

  middleware(req, res, next);
  process.exit(0);
}
debug();
