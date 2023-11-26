const User = require('../models/User');
const AllProps = require('../models/AllProps');

const getAllProps = async (req, res) => {
    try {
        const allProps = await AllProps.find().sort({ createdAt: -1 }).lean();

        if (!allProps.length) {
            return res.status(404).json({ message: 'No property found.' });
        }

        const propsWithOwner = await Promise.all(allProps.map(async(prop) => {
            const owner = await User.findById(prop.ownerId).lean().exec();
            return {
                proprietor: { 
                    name: owner.name, email: owner.email, image: owner.image, tel: owner.phoneNum 
                },
                ...prop
            }
        }))

        res.status(200).json(propsWithOwner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllPropById = async (req, res) => {
    const { id } = req.params;
    try {
        const allProp = await AllProps.findById(id).lean();

        if (!allProp) {
            return res.status(404).json({ message: 'No property found.' });
        }

        const owner = await User.findById(allProp.ownerId).lean().exec();

        const propWithOwner = {
            proprietor: { 
                name: owner.name, email: owner.email, image: owner.image, tel: owner.phoneNum 
            },
            ...allProp
        }

        res.status(200).json(propWithOwner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAllProps, getAllPropById };