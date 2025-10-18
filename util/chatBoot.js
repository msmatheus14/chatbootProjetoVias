import pkg from 'whatsapp-web.js'
import axios from 'axios'

const {Client, LocalAuth} = pkg

import qrcode from 'qrcode-terminal'

export class ChatBoot {

    constructor() {

        this.arraymsg = []
        this.obj = {}

        this.arraymsg = []

        this.client = new Client({
            authStrategy: new LocalAuth()
        });

        this.client.on('qr', qr => {
            qrcode.generate(qr, {small: true})
        })

        this.client.on('ready', () => {
            console.log('API WHATSAPP CONECTADA !')
        });

        this.client.on('message', async msg => {

            if(msg.fromMe){

            }else
            if(msg.body === '!registrarBuraco'){
                
                msg.reply('Olá!✌️\n\nEste é um projeto desenvolvido pelos alunos: Matheus Andrade e Gabriel Alves pelo IFMS Nova Andradina \n \n Envie a localização do buraco:🚩')
                
                this.arraymsg.push({mensagem: 'aguardandoLocalização', remetente: msg.from, etapa: 1})
            }

            if(this.arraymsg.some(p => p.mensagem == 'aguardandoLocalização' && p.remetente == msg.from && p.etapa == 1)){

                if(msg.location){


                    const responseCidade = await axios.put('https://projeto-vias.vercel.app/verificarCidadePorRua', {
                     
                            latitude: msg.location.latitude,
                            longitude: msg.location.longitude
                        
                    })

                    console.log(responseCidade.data)

                    const response = await axios.get('https://projeto-vias.vercel.app/verificarCidade', {
                        params: {
                            latitude: msg.location.latitude,
                            longitude: msg.location.longitude
                        }
                    })


                    if(responseCidade.data == 'Nova Andradina'){

                        this.arraymsg.push({remetente: msg.from, latitude: msg.location.latitude, longitude: msg.location.longitude, etapa: 2, valid: true})

                        msg.body = null

                        msg.reply(`Localização recebida! Buraco está na ${response.data.nomeRua}`)

                        msg.reply('Em sua opnião de 1 a 5 qual a gravidade do buraco?')

                    }else{
                        msg.reply(':(\n\n😓Lamento!\nInfelizmente estamos operando apenas em Nova Andradina.\nFavor forneça uma localização de Nova Andradina ou digite "Sair" para cancelar!')
                    }
                }
            }

            if(msg.body === 'sair' || msg.body === 'Sair' || msg.body === 'SAIR'){

                let etapa1 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 1 )
                let etapa2 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 2 )
                let etapa3 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 3 )
                let etapa4 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 4 )

                this.arraymsg.splice(etapa1, etapa1 >= 0 ? 1 : 0)
                this.arraymsg.splice(etapa2, etapa2 >= 0 ? 1 : 0)
                this.arraymsg.splice(etapa3, etapa3 >= 0 ? 1 : 0)
                this.arraymsg.splice(etapa4, etapa4 >= 0 ? 1 : 0)

                msg.reply('Cancelado!')
            }

            if(this.arraymsg.some(p => p.remetente == msg.from && p.etapa == 2 && p.valid == true)){


                if((msg.body == '1' || msg.body == '2' || msg.body == '3' || msg.body == '4' || msg.body == '5') && msg.body != null){

                    this.arraymsg.push({remetente: msg.from, mensagem: msg.body, etapa: 3})

                    let etapa2 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 2 )
                    
                    this.arraymsg[etapa2].valid = false

                    msg.reply('Digite uma descrição ou escreva NÃO:')
                }

                if(msg.body != '1' && msg.body != '2' && msg.body != '3' && msg.body != '4' && msg.body != '5' && msg.body != null){
                    
                    console.log(msg.body, "222")
                    
                    msg.reply('Numero inválido!\nFavor digite um número de 1 a 5!')
                }
            }

            if(this.arraymsg.some(p => p.remetente == msg.from && p.mensagem && p.etapa == 3)){

                if(msg.body === 'não' || msg.body === 'Não' || msg.body === 'nao' || msg.body === 'NAO' || msg.body === 'n' || msg.body === 'N'){

                    this.arraymsg.push({mensagem: 'SEM DESCRIÇÃO', remetente: msg.from, etapa: 4})
                   
                }else
                if(msg.body != '1' && msg.body != '2' && msg.body != '3' && msg.body != '4' && msg.body != '5' && msg.body != 'não' && msg.body != 'Não' && msg.body != 'nao' && msg.body != 'NAO' && msg.body != 'n' && msg.body != 'N'){
                
                    this.arraymsg.push({mensagem: msg.body, remetente: msg.from, etapa: 4})
                   
                }

                if(this.arraymsg.some(p => p.remetente == msg.from && p.etapa == 4)){
                    
                    let item1 = this.arraymsg.find(p => p.remetente == msg.from && p.etapa == 4)
                    let item2 = this.arraymsg.find(p => p.remetente == msg.from && p.etapa == 2)
                    let item3 = this.arraymsg.find(p => p.remetente == msg.from && p.etapa == 3)

                    let etapa1 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 1)
                    let etapa2 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 2)
                    let etapa3 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 3)
                    let etapa4 = this.arraymsg.findIndex(p => p.remetente == msg.from && p.etapa == 4)

                    this.arraymsg.splice(etapa1, etapa1 >= 0 ? 1 : 0)
                    this.arraymsg.splice(etapa2, etapa2 >= 0 ? 1 : 0)
                    this.arraymsg.splice(etapa3, etapa3 >= 0 ? 1 : 0)
                    this.arraymsg.splice(etapa4, etapa4 >= 0 ? 1 : 0)

                    this.obj = {
                        idDispositivo: item1.remetente,
                        descricao: item1.mensagem,
                        latitude: item2.latitude,
                        longitude: item2.longitude,
                        criticidade: item3.mensagem
                    }

                    try {
                        const response = await axios.post('https://projeto-vias.vercel.app/report', this.obj)
            
                        if(response){

                            if(response.status == 208){

                                msg.reply(`:) Esse buraco já foi informado por outro usuário, mas aumentamos a prioridade do seu reporte.\nObrigado por colaborar!\n\nTotal de reports desse buraco: ${response.data.confirmacoes.confirmacoes}`);

                                
                            }else
                            if(response.status == 201){

                                msg.reply('😉 Seu report foi adicionado com sucesso! Agradecemos por sua participação!')
                            }
                        }

                    } catch(error){
                        console.log('DEU ERRO NA API INTERNA DO SERVIDOR!')
                    }
                }
            }

        })
        
        this.client.initialize()
    }

}
