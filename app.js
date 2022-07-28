const express = require("express");
const bodyParser = require("body-parser");
const { render } = require("ejs");

const mongoose = require("mongoose");
const lodash = require("lodash");

mongoose.connect("mongodb+srv://admin-elvis:Kiraa24Ilonha313@todoapp.zpgbh.mongodb.net/todolistDB");

const itemSchema = {
    name: String
};

const listSchema = {
    name: String,
    item: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const defaultItems = [];

// Item.deleteMany({_id: "62dcd064d69b0b36d38fdb15"}, (err) => {err === true ? console.log(err) : console.log("Success delete")});

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static("public"));

let port = process.env.PORT;

if (port == null || port == "") {
  port = 8000;
}

app.listen(port);

app.get("/", function (req, res) {

    Item.find({}, (err, foundItem) => {

        if (foundItem === 0)
        {
            Item.insertMany(defaultItems, (err) => 
            {
                err === true ? console.log(err) : console.log("Success add items")
            });

            res.redirect("/");
        }
        else
            err === true ? console.log(err) : res.render("list", {listTitle: "Today", newListItems: foundItem});
    });
});

app.get("/:topic", (req, res) => {
    const customListName = lodash.capitalize(req.params.topic);

    List.findOne({name: customListName}, (err, result) => {

        if (!err)
        {
            if (!result)
            {
                const list = new List({
                    name: customListName,
                    item: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            }
            else
            {
                res.render("list", {listTitle: result.name, newListItems: result.item});
            }
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today")
    {
        item.save();
        res.redirect("/");
    } 
    else 
    {
        List.findOne({name: listName}, function(err, foundList){

            if (err) return console.log(err);

            foundList.item.push(item);
            foundList.save();

            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {
    const itemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today")
    {
        Item.findByIdAndRemove(itemId, (err) => {
            err === true ? console.log(err) : console.log("Sucess deleting");
    
            res.redirect("/");
        });
    }
    else
    {
        List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: itemId}}}, (err) =>
        {
            err === true ? console.log(err) : res.redirect("/" + listName);
        })
    }
});