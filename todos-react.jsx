// Se define la coleccion en donde estara la tarea
Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isClient) {
    // This code is executed on the client only
    Accounts.ui.config({
      passwordSignupFields: "USERNAME_ONLY"  
    });
    
    Meteor.subscribe("tasks");

   Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    React.render(<App />, document.getElementById("render-target"));
  });
}

if (Meteor.isServer) {
  // Solo publicá tareas que son publicas o que pertenesen al usuario actual    
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

Meteor.methods({
  addTask(text) {
    // Asegura que el usuario este logeado antes de ingresar una tarea
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  removeTask(taskId) {
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // Si la tarea es privada, asegura que solo el propietario pueda borrarlo
      throw new Meteor.Error("not-authorized");
    }
      
    Tasks.remove(taskId);
  },

  setChecked(taskId, setChecked) {
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // Si la tarea es privada, asegura que solo el propietario pueda destildar
      throw new Meteor.Error("not-authorized");
    }

      
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
    
  setPrivate(taskId, setToPrivate) {
    const task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }  
});

