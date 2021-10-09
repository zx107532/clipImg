### new ClipImg
    import ClipImg from '@zhuxiaozy/clipimg'

    const clipData = new ClipImg({
        el:Element,
        reviewCall:(reviewImgUrl) => {
            console.log(reviewImgUrl)
         }
    })



    cliData.setImg(imgFile:File)

    cliData.setSize(width:number, height:number)

    cliData.getClipData(imgSize:number).then(data => {
        console.log(data.blob)
        console.log(data.url)
    })
