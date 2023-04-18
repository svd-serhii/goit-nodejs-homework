import jimp from "jimp";

const resizeAvatar = async (imgPath, width, height) => {
  const image = await jimp.read(imgPath);

  await image.resize(width, height);

  await image.writeAsync(imgPath);
};

module.exports = resizeAvatar;
