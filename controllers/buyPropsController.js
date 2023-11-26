const BuyProps = require('../models/BuyProps');
const User = require('../models/User');
const AllProps = require('../models/AllProps');
const cloudinary = require('../config/cloudinary');

const createBuyProp = async (req, res) => {
    const {
        ownerId, title, price, option, rooms, bathrooms, description, state, town, street, 
    } = req.body;

    try {

        if (
            !ownerId || !title || !price || !option || !rooms || 
            !bathrooms || !description || !state || !town
        ) {
            return res.status(406).json({ message: 'Missing Fields'});
        }
        const images = req.files;
        const urls = [];
        const urlsId = [];
        for (const image of images) {
            const b64 = Buffer.from(image.buffer).toString('base64');
            let dataURI = "data:" + image.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {folder: 'pindro-realtor'});
            urls.push(result.secure_url);
            urlsId.push(result.public_id);
        }
        // const result = await Promise.all(images.map( async image => {
        //     const b64 = Buffer.from(image.buffer).toString('base64');
        //     let dataURI = "data:" + image.mimetype + ";base64," + b64;
        //     await cloudinary.uploader.upload(dataURI, {folder: 'pindro-realtor'});
        // }));
    
        const newProperty = await BuyProps.create({
            ownerId, title, price, rooms, bathrooms, description, location: {state, town, street},
            option, images: urls, imagesId: urlsId
        });

        await AllProps.create({
            ownerId, title, price, rooms, bathrooms, description, location: {state, town, street},
            options: option, images: urls, imagesId: urlsId

        })

        if (newProperty) {
            res.status(201).json({ message: 'Property Posted.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getBuyProps = async (req, res) => {
    try {
        const properties = await BuyProps.find().lean();
        
        if (!properties.length) {
            return res.status(404).json({ message: 'No Property Found' });
        }

        const propertiesWithOwner = await Promise.all(properties.map(async (property) => {
            const owner = await User.findById(property.ownerId).lean().exec();
            return {...property, proprietor: {
                name: owner.name, image: owner.image, tel: owner.phoneNum
            }}
        }))

        res.status(200).json(propertiesWithOwner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getBuyPropsWithPages = async (req, res) => {
    const { page } = req.query;
    try {
        const LIMIT = 4;
        const startIndex = (Number(page) - 1) * LIMIT; // get the start index of every page
        const total = await BuyProps.countDocuments({});

        const properties = await BuyProps.find()
        .sort({ createdAt: - 1 }).limit(LIMIT).skip(startIndex).lean();

        if (!properties) {
            return res.status(404).json({ message: 'No Property Found' });
        }

        const propertiesWithOwner = await Promise.all(properties.map(async (property) => {
            const owner = await User.findById(property.ownerId).lean().exec();
            return {...property, proprietor: {
                name: owner.name, image: owner.image, tel: owner.phoneNum
            }}
        }))

        res.status(200).json({
            data: propertiesWithOwner, currentPage: Number(page), pages: Math.ceil(total / LIMIT)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getBuyPropById = async (req, res) => {
    const { id } = req.params;
    try {
        const property = await BuyProps.findById(id).lean();
        
        if (!property) {
            return res.status(404).json({ message: 'Property Not Found'});
        }

        const propOwner = await User.findById(property.ownerId).lean();

        const propWithOwner = {
            proprietor: { 
                name: propOwner.name, image: propOwner.image, tel: propOwner.phoneNum 
            }, 
            ...property
        }

        res.status(200).json(propWithOwner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}


const updateBuyProp = async (req, res) => {
    // const { id } = req.params;
    const {
        id, ownerId, title, price, option, rooms, bathrooms, description, state, town, street
    } = req.body;

    try {
        const property = await BuyProps.findById(id);
        const propAtAllProps = await AllProps.findOne({ title: property.title }).lean();

        if (
            !id || !ownerId || !title || !price || !option || !rooms || 
            !bathrooms || !description || !state || !town
        ) {
            return res.status(406).json({ message: 'Fields Missing' });
        }
        
        property.title = title;
        property.price = price;
        property.option = option;
        property.rooms = rooms;
        property.bathrooms = bathrooms;
        property.description = description;
        property.location.state = state;
        property.location.town = town;
        property.location.street = street;

        await AllProps.findByIdAndUpdate(propAtAllProps._id, {
            title, price, options: option, rooms, bathrooms, description, state, town, 
            street, }, { new: true }
        );

        const updatedProp = await property.save();

        res.status(202).json({ message: `Property '${updatedProp.title}' updated` });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}


const updateBuyPropImg = async (req, res) => {
    const { id } = req.params;
    const { ownerId } = req.body;

    try {
        const property = await BuyProps.findById(id);
        const propertyAtAllProps = await AllProps.findOne({ title: property.title }).lean();

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await cloudinary.api.delete_resources(property.imagesId);

        const images = req.files;
        const urls = [];
        const urlsId = [];
        for (const image of images) {
            const b64 = Buffer.from(image.buffer).toString('base64');
            let dataURI = "data:" + image.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: 'pindro-realtor' });
            urls.push(result.secure_url);
            urlsId.push(result.public_id);
        }

        property.images = urls;
        property.imagesId = urlsId;

        propertyAtAllProps.images = urls;
        propertyAtAllProps.imagesId = urlsId;

        await AllProps.findByIdAndUpdate(propertyAtAllProps._id, { 
            images: urls, imagesId: urlsId }, { new: true } 
        );
        const updatedProp = await property.save();

        res.status(202).json({ message: `Images of property '${updatedProp.title}' updated` });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}


const deleteBuyProp = async (req, res) => {
    const { id } = req.params;
    
    try {
        const property = await BuyProps.findById(id);
        const propertyAtAllProps = await AllProps.findOne({ title: property.title });

        if (!property) {
            return res.status(404).json({ message: 'Inexistent Property'});
        }

        await cloudinary.api.delete_resources(property.imagesId);

        const reply = await property.deleteOne();
        await propertyAtAllProps.deleteOne();

        res.status(200).json({ message: `Property '${reply.title}' deleted`});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createBuyProp, getBuyProps, getBuyPropsWithPages, getBuyPropById, 
    updateBuyProp, updateBuyPropImg, deleteBuyProp
}