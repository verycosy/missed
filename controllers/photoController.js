import routes from "../routes";
import Photo from "../models/Photo";
import { setGrid } from "../utils";

export const home = async (req, res) => {
  let photos;

  try {
    photos = await Photo.find()
      .sort({ _id: -1 })
      .populate("creator");
  } catch (e) {
    console.log(e);
  }

  res.render("home", { page: "Home", photos: setGrid(photos) });
};

export const search = async (req, res) => {
  const {
    query: { term }
  } = req;

  let photos = [];

  try {
    photos = await Photo.find({
      title: { $regex: term, $options: "i" }
    }).populate("creator");
  } catch (e) {
    console.log(e);
  }
  console.log(setGrid(photos));
  res.render("search", {
    page: "Search",
    photos: setGrid(photos),
    term
  });
};

export const photoDetail = async (req, res) => {
  const {
    params: { id }
  } = req;

  try {
    const photo = await Photo.findById(id).populate("creator");
    res.render("photoDetail", { page: "PhotoDetail", photo });
  } catch (e) {
    console.log(e);
    res.redirect(routes.home);
  }
};

export const getUploadPhoto = (req, res) =>
  res.render("uploadPhoto", { page: "Upload Photo" });
export const postUploadPhoto = async (req, res) => {
  const {
    body: { title },
    file: { path }
  } = req;

  const newPhoto = await Photo.create({
    fileUrl: path,
    title,
    creator: req.user.id
  });

  req.user.photos.push(newPhoto.id);
  req.user.save();

  res.redirect(routes.photoDetail(newPhoto.id));
};

export const getEditPhoto = async (req, res) => {
  const {
    params: { id }
  } = req;

  try {
    const photo = await Photo.findById(id);
    res.render("editPhoto", { page: "Edit Photo", photo });
  } catch (e) {
    console.log(e);
    res.redirect(routes.home);
  }
};
export const postEditPhoto = async (req, res) => {
  const {
    body: { title },
    params: { id }
  } = req;

  try {
    await Photo.findByIdAndUpdate(id, { title });
    res.redirect(routes.photoDetail(id));
  } catch (e) {
    console.log(e);
    res.redirect(routes.home);
  }
};

export const deletePhoto = async (req, res) => {
  const {
    params: { id }
  } = req;

  try {
    await Photo.findByIdAndDelete(id); // 작성자 확인 후
    res.redirect(routes.home); // 이전 페이지로 돌아가야지.
  } catch (e) {
    console.log(e);
    res.redirect(routes.home); // 실패 메세지 띄워야 함
  }
};

export const postLike = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const photo = await Photo.findById(id);
    photo.likeUsers.addToSet(req.user.id);
    photo.save();
    res.status(200);
  } catch (error) {
    res.status(400);
  } finally {
    res.end();
  }
};

export const postDownload = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const photo = await Photo.findById(id);
    photo.downloadCnt += 1;
    photo.save();
    res.status(200);
  } catch (error) {
    res.status(400);
  } finally {
    res.end();
  }
};
