export const getUser = () => {
    const user = localStorage.getItem('user')
    return user
}

export const setUser = (payload) => {
    localStorage.setItem('user', JSON.stringify(payload))
}
//