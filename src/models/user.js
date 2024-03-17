const { DataTypes } = require("sequelize");
const sequelize = require("../db"); 

const Article = require("./article");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT,
    defaultValue:
      "/9j/4AAQSkZJRgABAQEBLAEsAAD/4QBWRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAAEsAAAAAQAAASwAAAAB/+0ALFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAPHAFaAAMbJUccAQAAAgAEAP/hDIFodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nIHg6eG1wdGs9J0ltYWdlOjpFeGlmVG9vbCAxMC4xMCc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp0aWZmPSdodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyc+CiAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICA8dGlmZjpYUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpYUmVzb2x1dGlvbj4KICA8dGlmZjpZUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpZUmVzb2x1dGlvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wTU09J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8nPgogIDx4bXBNTTpEb2N1bWVudElEPmFkb2JlOmRvY2lkOnN0b2NrOjYxZjJlN2QwLTc5ZmQtNGM3OC1iNDhiLTU2YmNjOWVkMGY0YjwveG1wTU06RG9jdW1lbnRJRD4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjQzZGE3ZmFiLTllMGUtNDQ2NC05ZmUyLTQ4OWU1YmJlYzJiNjwveG1wTU06SW5zdGFuY2VJRD4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSd3Jz8+/9sAQwAFAwQEBAMFBAQEBQUFBgcMCAcHBwcPCwsJDBEPEhIRDxERExYcFxMUGhURERghGBodHR8fHxMXIiQiHiQcHh8e/9sAQwEFBQUHBgcOCAgOHhQRFB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4e/8AAEQgBaAFoAwERAAIRAQMRAf/EAB0AAQACAgMBAQAAAAAAAAAAAAAHCAYJAwQFAQL/xABHEAABBAECAgcEBgYIBgIDAAABAAIDBAUGEQchCBIxQVFhcRMUMoEJIlJygqEVM0NiY5EWGCMkorGywhclN3N1koOTs9LT/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwC5aAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOK1Zr1IHWLU8UELBu6SR4a0DzJ5II91Lxz4TafkfFf1xipJW9sdR5su38Nog5BgGX6XfDGp1m0aWosi4dhjptiafnI8H8lcGNWumdhGuPuug8rKPGW9FH/kHJg639dKrv/06sbf+Xb//ACTB2avTOwjnD3rQeViHjFeik/zDUwZLiOl3wxt9Vt6lqLHOPaZKbZWj5xvJ/JMGf6a458JtQSMioa4xUcruyO281nb+G0oaoJCq2a9uBtirPFPC8btkjeHNI8iOSDlQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAJ2QRLxO6QnDbQr5ac2VOYyke4NHGbTOa7we/fqM9Cd/JBWzX/AEtNfZp0kGmKdHTVU7hrw0WbO33njqD5N+auCD9T6o1JqeybGo89k8vIe+3ZdIB6NJ6o+QCDxxyGw5DwCoICAgICAeY2PMeBQexpjVGpNMWRY05nsniJB31LLowfVoPVPzBUE4aA6WmvsK6ODU9OjqWqNg55aK1nb7zB1D82/NMFk+GPSE4ba6fFThypw+Uk2Ao5PaFzneDH79R/oDv5KCWgd0BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQRvxj40aL4Y1jHl7ht5dzOtDi6hDp3+B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tZ2+689Q/J3yV0QfqfS+pNMWTX1HgcniJB3W6zowfRxHVPyJQeOOY3HMeIVBAQEBAQDyG55DxKD2NMaX1JqeyK+nMDk8vIe6pWdIB6uA6o+ZCgnDQHRL19mnRz6nuUdNVTsXMLhZs7fdYeoPm75Josnwx6PfDfQr4rkOKOYykexF7J7TOa7xYzbqM9QN/NQS0BsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4rVavbgdXtQRTwvGzo5GBzSPMHkgj3UvAzhNqCR8t/Q+Kjld2yVGGq7fx3iLUGAZfoicMbfWdRu6ixzj2CO42Ro+UjCfzV0Y1a6GOEc4+668ysQ8JaMUn+Ramjq/1Lq3W/6i2Nv/ABDd/wD8qaO1V6GOEa4e9a8yso8IqMUf+ZcmjJcR0ROGNTquvXdRZFw7RJcbG0/KNgP5poz/AE1wM4TafkZLQ0PipJW9klthtO38d5S5QSFVrV6kDa9WCKCFg2bHGwNaB5AckHKgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/2Q==",
  },
  birthday: {
    type: DataTypes.DATE,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, 
  },
});

User.hasMany(Article, { foreignKey: "authorId", as: "articles" });
User.belongsToMany(User, {
  as: "Followers",
  foreignKey: "followingId",
  through: "Follow",
});
User.belongsToMany(User, {
  as: "Following",
  foreignKey: "followerId",
  through: "Follow",
});
User.belongsToMany(Article, {
  through: "LikedShares",
  as: "LikedArticles",
  foreignKey: "userId",
});


module.exports = User;
