import pkg from 'whatsapp-web.js'
import axios from 'axios'

const { Client, LocalAuth } = pkg
import qrcode from 'qrcode-terminal'

export class ChatBoot {

    constructor() {

        this.userStates = {} // substitui arraymsg
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: '/usr/bin/chromium-browser',
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-extensions',
                    '--disable-gpu',
                    '--single-process',
                    '--no-zygote'
                ]
            }
        });

        this.client.on('qr', qr => qrcode.generate(qr, { small: true }))

        this.client.on('ready', () => console.log('API WHATSAPP CONECTADA !'))

        this.client.on('message', async msg => {

            if(msg.fromMe) return;

            const from = msg.from;
            const state = this.userStates[from] || { etapa: 0 };

            // Etapa 1: registrar buraco
            if(msg.body === '!registrarBuraco') {
                msg.reply('Olá!✌️\n\nEste é um projeto desenvolvido pelos alunos: Matheus Andrade e Gabriel Alves pelo IFMS Nova Andradina \n \n Envie a localização do buraco:🚩');
                this.userStates[from] = { etapa: 1, status: 'aguardandoLocalizacao' };
                return;
            }

            // Cancelar operação
            if(['sair', 'Sair', 'SAIR'].includes(msg.body)) {
                delete this.userStates[from];
                msg.reply('Cancelado!');
                return;
            }

            // Etapa 1: receber localização
            if(state.etapa === 1 && state.status === 'aguardandoLocalizacao' && msg.location) {
                try {
                    const responseCidade = await axios.put('https://projeto-vias.vercel.app/verificarCidadePorRua', {
                        latitude: msg.location.latitude,
                        longitude: msg.location.longitude
                    });

                    const response = await axios.get('https://projeto-vias.vercel.app/verificarCidade', {
                        params: { latitude: msg.location.latitude, longitude: msg.location.longitude }
                    });

                    if(responseCidade.data === 'Nova Andradina') {
                        this.userStates[from] = {
                            etapa: 2,
                            latitude: msg.location.latitude,
                            longitude: msg.location.longitude,
                            valid: true
                        };
                        msg.reply(`Localização recebida! Buraco está na ${response.data.nomeRua}`);
                        msg.reply('Em sua opnião de 1 a 5 qual a gravidade do buraco?');
                    } else {
                        msg.reply(':(\n\n😓 Lamento!\nInfelizmente estamos operando apenas em Nova Andradina.\nFavor forneça uma localização de Nova Andradina ou digite "Sair" para cancelar!');
                    }
                } catch(e) {
                    console.log('Erro ao verificar cidade:', e);
                    msg.reply('😓 Ocorreu um erro ao verificar a cidade.');
                }
                return;
            }

            // Etapa 2: gravidade do buraco
            if(state.etapa === 2 && state.valid) {
                if(['1','2','3','4','5'].includes(msg.body)) {
                    this.userStates[from] = {
                        ...state,
                        etapa: 3,
                        gravidade: msg.body,
                        valid: false
                    };
                    msg.reply('Digite uma descrição ou escreva NÃO:');
                } else if(msg.body != null) {
                    msg.reply('Número inválido!\nFavor digite um número de 1 a 5!');
                }
                return;
            }

            // Etapa 3: descrição
            if(state.etapa === 3) {
                let descricao = ['não','nao','n'].includes(msg.body.toLowerCase()) ? 'SEM DESCRIÇÃO' : msg.body;

                const reportObj = {
                    idDispositivo: from,
                    descricao,
                    latitude: state.latitude,
                    longitude: state.longitude,
                    criticidade: state.gravidade
                };

                try {
                    const response = await axios.post('https://projeto-vias.vercel.app/report', reportObj);

                    if(response.status === 208) {
                        msg.reply(`:) Esse buraco já foi informado por outro usuário, mas aumentamos a prioridade do seu reporte.\nObrigado por colaborar!\n\nTotal de reports desse buraco: ${response.data.confirmacoes.confirmacoes}`);
                    } else if(response.status === 201) {
                        msg.reply('😉 Seu report foi adicionado com sucesso! Agradecemos por sua participação!');
                    }
                } catch(error) {
                    console.log('Erro na API interna:', error);
                    msg.reply('😓 Ocorreu um erro ao enviar seu reporte. Tente novamente mais tarde.');
                }

                delete this.userStates[from]; // finaliza fluxo
                return;
            }

        });

        this.client.initialize();
    }

}
