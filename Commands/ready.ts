import { MongoService } from "../Services/MongoService"

export async function ready() {
    const didConnect = await MongoService.connect()
    if (didConnect) {
        console.log("Banco de dados iniciado com sucesso!")
        return
    }
    throw new Error("Não foi possível acessar o banco de dados!")
}