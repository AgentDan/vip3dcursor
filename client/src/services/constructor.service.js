const userModelsNames = (files) => {
    return files.map(file => file.filename.replace(/[^a-zA-Z]/g, ''));
}

export default {userModelsNames};