import Web3Utils from 'web3-utils'
const Remittance = artifacts.require('Remittance')

contract('Transaction Accounting', accounts => {
  let remittance
  let pwHash
  const remitter = accounts[0]
  const vendor = accounts[1]
  const recipientPw = 'superS3cr3tRec1p13ntPw'
  const vendorPw = 'superS3cr3tV3nd0rPw'

  beforeEach('deploy new instance', async () => {
    remittance = await Remittance.new({ from: remitter })
    pwHash = Web3Utils.soliditySha3(vendor, recipientPw, vendorPw)
  })

  describe('remittance contract', () => {
    it('receives money from the sender', async function () {
      const ethValue = 0.5
      const weiValue = Web3Utils.toWei(ethValue.toString())

      const remBefore = await remittance.remittances(pwHash)
      const tx = await remittance.sendMoney(pwHash, {from: remitter, value: weiValue})
      const remAfter = await remittance.remittances(pwHash)

      expect(tx.logs.length).to.be.equal(1)
      const log = tx.logs[0]
      expect(log.event).to.be.equal('MoneySent')
      expect(log.args._passwordHash).to.be.equal(pwHash)
      expect(log.args._amount.toString(10)).to.be.equal(weiValue.toString(10))

      expect(remAfter.sub(remBefore).toString(10)).to.equal(weiValue.toString(10))
    })
    it('allows the vendor to withdraw', async function () {
      const ethValue = 0.5
      const weiValue = Web3Utils.toWei(ethValue.toString())

      await remittance.sendMoney(pwHash, { from: remitter, value: weiValue })

      const remBefore = await remittance.remittances(pwHash)
      const tx = await remittance.withdraw(recipientPw, vendorPw, { from: vendor })
      const remAfter = await remittance.remittances(pwHash)

      expect(tx.logs.length).to.be.equal(1)
      const log = tx.logs[0]
      expect(log.event).to.be.equal('WithdrawalMade')
      expect(log.args._by).to.be.equal(vendor)

      expect(remBefore.sub(remAfter).toString(10)).to.equal(weiValue.toString(10))
      expect(remAfter.toString(10)).to.equal('0')
    })
    // it('can receive multiple deposits', async function () {
    //   const ethValue = 0.5
    //   const weiValue = Web3Utils.toWei(ethValue.toString())
    //   await remittance.sendMoney(pwHash, {from: sender, value: weiValue})
    // })
  })
})
