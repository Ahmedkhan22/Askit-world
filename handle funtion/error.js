function handleErr(err,msg) {
    if (err) return {
        message: msg,
        error:true,
        err
    }
}

module.exports =handleErr;