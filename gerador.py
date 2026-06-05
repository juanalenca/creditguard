import gerador
from gerador.image.pure import PyPNGImage

def gerar_qrcode(url: str, caminho_saida: str = "qrcode.png") -> None:
    """
    Gera uma imagem de QR Code a partir de uma URL especificada e a salva no disco.

    Args:
        url (str): O link de destino que será codificado no QR Code.
        caminho_saida (str): O caminho do arquivo e nome da imagem a ser salva.
                             Por padrão, salva como 'qrcode.png' no diretório atual.

    Raises:
        ValueError: Se a URL fornecida estiver vazia.
    """
    if not url.strip():
        raise ValueError("A URL fornecida não pode estar vazia.")

    # Configuração da estrutura do QR Code
    # version=1 define o menor tamanho de matriz (21x21). fit=True ajustará automaticamente se necessário.
    # error_correction=ERROR_CORRECT_L define o nível de correção de erro baixo (até 7% de danos).
    # box_size define o tamanho em pixels de cada "quadrado" do QR Code.
    # border define a espessura da borda branca (mínimo recomendado é 4).
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    # Adiciona os dados ao objeto
    qr.add_data(url)
    qr.make(fit=True)

    # Renderiza a imagem com cores predefinidas
    imagem_qr = qr.make_image(fill_color="black", back_color="white")
    
    # Salva o arquivo no caminho determinado
    imagem_qr.save(caminho_saida)

if __name__ == "__main__":
    LINK_ALVO = "https://voluble-vacherin-c51643.netlify.app/"
    ARQUIVO_SAIDA = "link_qrcode.png"
    
    try:
        gerar_qrcode(LINK_ALVO, ARQUIVO_SAIDA)
        print(f"QR Code gerado com sucesso e salvo como: {ARQUIVO_SAIDA}")
    except Exception as erro:
        print(f"Erro ao gerar o QR Code: {erro}")