const mongoose = require('mongoose');
const Users = require('../models/Users'); //importando o modelo de Users
const bcrypt = require('bcrypt');

module.exports = {
    signup: async (req, res) => {
        const {avatar, nome, nick, email, password, score, ranking} = req.body;

        const userExist = await Users.findOne({email});//verificamos se existe email cadastrado
        if(userExist){//se existir retorna usuario invalido e para aa execução
            res.json({
                data:[],
                error: 'usuario invalido'
            });
            return;//encerrra a execução
        }

        const passwordHash = await bcrypt.hash(password, 10);


       
        let addUser = new Users({avatar, nome, nick, email, passwordHash, score, ranking});
        const saveUsers = await addUser.save();
        if(!saveUsers) {
            res.json({
                error: 'Erro ao adicionar User'
            });
            return;
        } 
            res.json({
                data: saveUsers
            });
        
    },
    signin: async (req, res)=>{
        const {email, password}= req.body;
        const userExist = await Users.findOne({email});
        if(!userExist){
            res.json({
                data:[],
                email: "usuario invalido"
            });
            return;
        }
        const match = await bcrypt.compare(password, userExist.passwordHash);
        if(!match) {
            res.json({
                data:[],
                error:'credential invalida'
            });
            return;
        }
        res.json({
            data: userExist
        });
    },

    ranking: async(req, res) => {
      const rankingList = await Users.find({ranking: {$gt: 0}, score: {$ne: 0}})
      .sort({ranking: 1})
      .limit(10)
      .select({
        ranking: 1,
        avatar: 1,
        nick: 1,
        score: 1,
        _id: 0
      }).exec();
      res.json({
        data: rankingList
      });
        
    },
    /*
    getId: async(req, res) => {
        const id = req.params.id;
        const listUsers = await Users.findById(id);
        if(!listUsers){
            res.json({
                error: 'Erro ao recuperar os registros'
            });
        }else {
            res.json({
                data: listUsers
            })
        }
    },
    deleteId: async(req, res) => {
        const id = req.params.id;
        const listUsers = await Users.findByIdAndDelete(id);
        if(!listUsers){
            res.json({
                error: 'Erro ao recuperar os registros'
            });
        }else {
            res.json({
                data: listUsers
            })
        }
    },*/
    
    updateId: async(req, res) => {
        const id = req.params.id;
        const {avatar, nome, nick, email} = req.body;

        const userUpdate = await Users.findByIdAndUpdate(id, {avatar, nome, nick, email});

        if(!userUpdate) {
            res.json({
                data: [],
                erro: 'Não foi possivel localizar o User'
            });
        } else {
            res.json({
                data:userUpdate
            });
        }
    },

    score: async(req, res)=> {
        const nick = req.params.nick;
        const novoScore = req.params.score;
        const user = await Users.findOne({nick});

        if(!user){
            res.json({
                data:[],
                error: 'usuario invalido'
            });
            return;
        }
        const id= user._id;
        const scoreAtual = user.score;

        if(novoScore > scoreAtual){
            await Users.findByIdAndUpdate(id, {score:novoScore});
            const geraRanking = await Users.aggregate([
                {
                    $setWindowFields: {
                        sortBy: {score: -1},
                        output: {
                            ranking: {
                                $rank: {}
                            }
                        }
                    }
                }
            ]).exec();
            geraRanking.map(user => {
                Users.updateOne({_id: user._id}, {ranking: user.ranking}).exec();
            });
            
        }
        res.json({
            data: [],
            msg: 'Score alterado com sucesso'
        })
    }

}