const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    const { firstname, lastname, email, phoneNum, password } = req.body;

    try {
        const existingUser = await User.findOne({ email }).lean();

        if (existingUser) {
            return res.status(409).json({ message: 'User already exist' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, {folder: 'pindro-realtor'});

        const hashedPWD = await bcrypt.hash(password, 10);

        await User.create({
            name: `${firstname} ${lastname}`,
            email,
            phoneNum,
            password: hashedPWD,
            image: result.secure_url,
            imageId: result.public_id
        });

        res.status(201).json({message: 'Registered successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        if (!users.length) {
            res.status(404).json({ message: 'No User Found'});
        }

        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User Not Found' })
        }

        res.status(200).json(user);
    } catch (error) {
        
    }
}


const updateUser = async (req, res) => {
    // const { id } = req.params;
    const { id, firstname, lastname, email, phoneNum, password } = req.body;

    try {
        const user = await User.findById(id);

        if (!id || !firstname || !lastname || !phoneNum || !email) {
            return res.status(406).json({ message: 'Fields missing'});
        }

        if (!user) {
            return res.status(404).json({ message: 'User Not Found' });
        }

        const duplicate = await User.findOne({ email });

        if (duplicate && duplicate._id.toString() !== id) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        user.name = `${firstname} ${lastname}`;
        user.email = email;
        user.phoneNum = phoneNum;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await user.save();
        
        res.status(202).json({ message: `'${updatedUser.name}' updated successfully`});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const updateUserImg = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User Not Found' });
        }

        await cloudinary.uploader.destroy(user.imageId, {folder: 'pindro-realtor'});

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, { folder: 'pindro-realtor' });

        user.image = result.secure_url;
        user.imageId = result.public_id;

        const updatedUser = await user.save();
        
        res.status(202).json({ message: `'${updatedUser.name}'s image updated successfully`});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const deleteAccount = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Inexistent User' });
        }

        await cloudinary.uploader.destroy(user.imageId, { folder: 'pindro-realtor' });

        const result = await user.deleteOne();

        res.status(200).json({ message: `'${result.name}'s account deleted`});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createUser, getUsers, getUserById, updateUser, updateUserImg, deleteAccount
}