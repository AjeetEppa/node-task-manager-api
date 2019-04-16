const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (err) => {
    if (err) {
        return console.log("Connection Error", err)
    }
})


// const Orders = mongoose.model('Orders', {
//     ordername: {
//         type: String,
//         require: true,
//     },
//     orderItems: {
//         type: mongoose.Mixed,
//         require: true
//     }
// })

// const me = User.find({ password: 'scarlgf9' }, function (err, res) {
//     if (err) {
//         return console.log("Error !", err)
//     }
//     console.log(res)
//     res[0].email = "ranjeet@gmail.com";

//     res[0].save().then((result) => {
//         console.log(result)
//     }).catch((err) => {
//         console.log("Error! ", err)
//     })

// })


// const neworder = new Orders({})

// neworder.ordername = 'First Order';
// neworder.orderItems = ['shoes','Goggles','dress','LED TV']

// neworder.save().then((res)=>{console.log(res)}).catch((err)=>{console.log("Error : ",err)});
