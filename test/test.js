import Web3Utils from 'web3-utils'
import { BigNumber } from 'bignumber.js'
const Remitter = artifacts.require('Remitter')

contract('Transaction Accounting', accounts => {
  let remitter
  let pwHash
  const sender = accounts[0]
  const vendor = accounts[1]
  const recipientPw = 'superS3cr3tRec1p13ntPw'
  const blocksTilExpired = 100

  beforeEach('deploy new instance', async () => {
    remitter = await Remitter.new({ from: sender })
    pwHash = Web3Utils.soliditySha3(vendor, recipientPw)
  })

  describe('remittance contract', () => {
    it('receives money from the sender', async function () {
      const weiValue = Web3Utils.toWei(new BigNumber(0.5).toString())
      const remBefore = await remitter.remittances(pwHash)
      const tx = await remitter.sendMoney(pwHash, blocksTilExpired, {from: sender, value: weiValue})
      const remAfter = await remitter.remittances(pwHash)
      expect(tx.logs.length).to.be.equal(1)
      const log = tx.logs[0]
      expect(log.event).to.be.equal('MoneySent')
      expect(log.args._passwordHash).to.be.equal(pwHash)
      expect(log.args._amount.toString(10)).to.be.equal(weiValue.toString(10))

      expect(remAfter[0].sub(remBefore[0]).toString(10)).to.equal(weiValue.toString(10))
    })
    it('allows the vendor to withdraw', async function () {
      const weiValue = Web3Utils.toWei(new BigNumber(0.5).toString())

      await remitter.sendMoney(pwHash, blocksTilExpired, { from: sender, value: weiValue })

      const remBefore = await remitter.remittances(pwHash)
      const tx = await remitter.withdraw(recipientPw, { from: vendor })
      const remAfter = await remitter.remittances(pwHash)

      expect(tx.logs.length).to.be.equal(1)
      const log = tx.logs[0]
      expect(log.event).to.be.equal('WithdrawalMade')
      expect(log.args._by).to.be.equal(vendor)

      expect(remBefore[0].sub(remAfter[0]).toString(10)).to.equal(weiValue.toString(10))
      expect(remAfter[0].toString(10)).to.equal('0')
    })
    // it('can receive multiple deposits', async function () {
    //   const ethValue = 0.5
    //   const weiValue = Web3Utils.toWei(ethValue.toString())
    //   await remittance.sendMoney(pwHash, blocksTilExpired, {from: sender, value: weiValue})
    // })
  })
})
