import express from "express";
const router = express.Router();
import { check } from "express-validator";

import handleErrors from "./handleErrors";

import auth from "../../middleware/auth";

// Models
import { IList, IUser } from "models";
import List from "../../models/List";
import User from "../../models/User";

// @route   GET api/lists
// @desc    Get all user's lists
// @access  PRIVATE
router.get("/", auth, async (req: any, res) => {
  try {
    // Get lists by most recent
    const user: IUser = await User.findById(req.user.id);
    let lists: IList[] = await Promise.all(
      user.accessCodes.map(accessCode => {
        return List.findOne({ accessCode }).sort({
          date: -1
        });
      })
    );
    let personalLists: IList[] = await List.find({ user: req.user.id });

    lists = lists.filter(list => list !== null);
    res.json([...lists, ...personalLists]);
  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   POST api/lists
// @desc    Create a list
// @access  PRIVATE
router.post(
  "/",
  [auth, [check("name", "Please enter a name").not().isEmpty()]],
  async (req, res) => {
    if (handleErrors(req, res)) return;

    const { name, accessCode } = req.body;
    try {
      const newList: IList = new List({
        name,
        accessCode: accessCode,
        user: req.user.id
      });

      const checkList = async accessCode => {
        if (accessCode === "") return null;
        const existingList: IList = await List.findOne({ accessCode });
        return existingList;
      };

      const exists = await checkList(accessCode);

      // Existing public list
      if (exists) {
        res.json(exists);
        await (await User.findById(req.user.id)).updateOne({
          $push: { accessCodes: exists.accessCode }
        });

        await List.findByIdAndUpdate(exists.id, {
          count: ++exists.count
        });
        return;
      }

      const list: IList = await newList.save();
      res.json(list);

      // New private list
      if (accessCode === "") return;

      // New public list
      await (await User.findById(req.user.id)).updateOne({
        $push: { accessCodes: accessCode }
      });
    } catch (e) {
      console.error(e.message);
      res.status(500).send({ msg: "Server Error" });
    }
  }
);

// @route   DELETE api/lists
// @desc    Delete a user's list
// @access  PRIVATE
router.delete("/:id", auth, async (req: any, res) => {
  try {
    const listId = req.params.id;

    const list: IList = await List.findById(listId);
    if (!list) return res.status(404).send({ msg: "List not found" });

    const accessCode = list.accessCode;

    // Local list
    if (!accessCode || list.count - 1 < 1) {
      await List.findByIdAndRemove(listId);
      // Shared list
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { accessCodes: accessCode }
      });
      await List.findByIdAndUpdate(listId, { count: --list.count });
    }

    res.send({ msg: "List removed" });
  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

export default router;
