const path = require("path");
const fs = require("fs");
const authorController = require("../controller/authorController");
const Article = require("../model/Article");
const User = require("../model/user");

var like = new Boolean(false)
let lista = [];
class ArticleController {
  static createLog(error) {
    const timestamp = Date.now();
    const archivePath = path.resolve(__dirname, "..", `logs-${timestamp}.txt`);
    const errorString = JSON.stringify(error.message);
    fs.writeFile(archivePath, errorString, function (err, result) {
      if (err) console.log(err);
    });
  }
  static async create(req, res) {
    const { title, text, authorid } = req.body;
    if (!title || !text || !authorid)
      return res
        .status(400)
        .send({ message: "os campos não podem estarem vazios " });
    if (title.length < 3)
      return res
        .status(400)
        .send({ message: "o titulo não pode ser menor que 3 caracteres" });
    if (text.length < 15)
      return res
        .status(400)
        .send({ message: "o artigo não pode ser menor que 15 caracteres" });
    try {
      const author = await authorController.getAuthor(authorid);
      const article = {
        title,
        text,
        likes: 0,
        author,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        removedAt: null,
      };
      await Article.create(article);
      return res.status(201).send({ message: "Artigo criado com sucesso" });
    } catch (error) {
      ArticleController.createLog(error);
      return res
        .status(500)
        .send({ error: "Falha ao salvar o artigo", data: error.message });
    }
  }

  static async likeArticle(req, res) {
    const { idUser, id } = req.params;

    if (!idUser || !id) return res.status(400).send({ message: "No id provider" });
    try {
      const article = await Article.findById(id);
      const user = await User.findById(idUser);


      if(!lista.includes(user)){
        if(like)
        {
          await Article.findByIdAndUpdate({ _id: id }, { likes: ++article.likes });
          like = false;
          lista.push(user);
          // console.log(like);
          // console.log("aqui");
          return res.status(200).send();
        }
      }

      if(!like)
      {
        await Article.findByIdAndUpdate({ _id: id }, { likes: --article.likes });
        like = true;
        // console.log(like);
        return res.status(200).send();
      }
    } catch (error) {
      ArticleController.createLog(error);
      return res
        .status(500)
        .send({ error: "Falha ao curtir", data: error.message });
    }
  }
}

module.exports = ArticleController;