const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')

const PurchaseMail = require('../jobs/PurchaseMail')

const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    const purchase = await Purchase.create({
      buyer: user,
      ad: purchaseAd,
      content
    })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }
  async acceptPurchase (req, res) {
    const id = req.params.id

    const purchase = await Purchase.findById(id).populate('ad')
    const adId = purchase.ad._id
    const buyer = purchase.buyer

    const accepted = await Ad.findByIdAndUpdate(
      adId,
      {
        purchasedBy: buyer
      },
      { new: true }
    )

    return res.json(accepted)
  }
}

module.exports = new PurchaseController()
