import { useState, useEffect, useRef, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
} from "@material-ui/core";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: { marginTop: 10, padding: 10 },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

function Todos() {
  
  const limit=20;
  
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const loader = useRef(null);
  const observer = useRef(null);
  
  useEffect(() => {
    fetch(`http://localhost:3001/?page=${page}&limit=${limit}`)
    .then((response) => response.json())
    .then((newTodos) => {
      if(newTodos.length == 0){
        observer.current && loader.current && observer.current.unobserve(loader.current);
      } else{
        setTodos([...todos,...newTodos]);
      }
    });
  }, [setTodos, page]);
  
  const loaderRefCallback = useCallback((node)=>{
    if(node && !loader.current && !observer.current){
      loader.current=node;
      observer.current = new IntersectionObserver((entities) => {
        const target = entities[0];
        if (target.isIntersecting) {   
          setPage((page) => page + 1)
        }
      }, {
        root: null,
        rootMargin: "20px",
        threshold: 1.0
      });
      observer.current.observe(loader.current)
      console.log(observer.current);
    }
  }); 
  
  function addTodo(text) {
    fetch("http://localhost:3001/", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ text }),
  })
  .then((response) => response.json())
  .then((todo) => setTodos([...todos, todo]));
  setNewTodoText("");
}

function toggleTodoCompleted(id) {
  fetch(`http://localhost:3001/${id}`, {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  method: "PUT",
  body: JSON.stringify({
    completed: !todos.find((todo) => todo.id === id).completed,
  }),
}).then(() => {
  const newTodos = [...todos];
  const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
  newTodos[modifiedTodoIndex] = {
    ...newTodos[modifiedTodoIndex],
    completed: !newTodos[modifiedTodoIndex].completed,
  };
  setTodos(newTodos);
});
}

function deleteTodo(id) {
  fetch(`http://localhost:3001/${id}`, {
  method: "DELETE",
}).then(() => setTodos(todos.filter((todo) => todo.id !== id)));
}

return (
  <Container maxWidth="md">
  <Typography variant="h3" component="h1" gutterBottom>
  Todos
  </Typography>
  <Paper className={classes.addTodoContainer}>
  <Box display="flex" flexDirection="row">
  <Box flexGrow={1}>
  <TextField
  fullWidth
  value={newTodoText}
  onKeyPress={(event) => {
    if (event.key === "Enter") {
      addTodo(newTodoText);
    }
  }}
  onChange={(event) => setNewTodoText(event.target.value)}
  />
  </Box>
  <Button
  className={classes.addTodoButton}
  startIcon={<Icon>add</Icon>}
  onClick={() => addTodo(newTodoText)}
  >
  Add
  </Button>
  </Box>
  </Paper>
  {todos.length > 0 && (
    <Paper className={classes.todosContainer}>
    <Box display="flex" flexDirection="column" alignItems="stretch">
    {todos.map(({ id, text, completed }) => (
      <Box
      key={id}
      display="flex"
      flexDirection="row"
      alignItems="center"
      className={classes.todoContainer}
      >
      <Checkbox
      checked={completed}
      onChange={() => toggleTodoCompleted(id)}
      ></Checkbox>
      <Box flexGrow={1}>
      <Typography
      className={completed ? classes.todoTextCompleted : ""}
      variant="body1"
      >
      {text}
      </Typography>
      </Box>
      <Button
      className={classes.deleteTodo}
      startIcon={<Icon>delete</Icon>}
      onClick={() => deleteTodo(id)}
      >
      Delete
      </Button>
      </Box>
      ))}
      <Box className="last" ref={loaderRefCallback} onClick={()=>{
        console.log(loader);
      }}>
      </Box>
      </Box>
      </Paper>
      )}
      </Container>
      );
    }
    
    export default Todos;
    