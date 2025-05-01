class loadBalancer {
    constructor(servers){
        this.servers = servers
        this.currentIndex = 0;
    }

    getNextServer () {
        const server  = this.servers[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.servers.length // rotation circulaire on partage equitablement les requêtes sur nos différents serveurs
        return server;
    }

}

module.exports = loadBalancer