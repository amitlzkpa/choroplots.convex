# Choroplots

## Stack

- convex
- clerk
- vite
- react
- mantine

### Project lifecycle

**Flow**

Text in curly brackets `{}` shows data extracted and stored as project level variables, OR, project level logical operations.

Square brackets `[]` indicate user input required.

1. Upload documents which contain base information and outline terms of agreement.  
   eg: Multiple agreements, conditions, terms

```md
{SRC_DOCS}
```

2. Upload documents (or connect events) which contain records relevant to agreement.  
   eg: Logs, Communications, Statements, Bills, Invoices, CSVs

```md
{RECORDS}
```

3. Take docs from step 1 and extract follwing information:

```md
{SRC_DOCS}

- {PROJECT_TERMS}
- {ROLES}
```

4. Allow user to review and modify it

```md
[review project terms]
[assign roles]
```

5. Take files from step 2 and extract following information:

```md
{RECORDS}

- {PARTIES}
```

6. Allow user to review and modify it

```md
[party extraction]
[party to role assignment]
```

7. Start complicance check routine:

```md
<compliance check routine>
```
