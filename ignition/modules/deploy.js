const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("LockModule", (m) => {
  const oracleAddr = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const lock = m.contract("LandTokenization", [oracleAddr]);

  return { lock };
});
