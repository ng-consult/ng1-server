/**
 * Created by antoine on 9/02/16.
 */

export default class TodoCtrl {

    constructor(){
        console.log('TodoCtrl Loaded', this);
    }

    addTodo = () => {
        this.todos.push({text:this.todoText, done:false});
        this.todoText = '';
    };


    title = "Todos title";

    todos = [
        {text:'learn angular', done:true},
        {text:'build an angular app', done:false}];

    todoText = '';


}