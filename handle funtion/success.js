function handleSuccess(data,msg) {
    if (data) return {
        message: msg,
        success:true,
        data: data
    }
}

module.exports=handleSuccess;