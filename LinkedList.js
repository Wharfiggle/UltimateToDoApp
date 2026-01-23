class Node
{
    constructor(value)
    {
        this.value = value
        this.next = null
    }
}

export default class LinkedList
{
    constructor()
    {
        this.head = null
    }

    push(value)
    {
        let node = new Node(value)
        
        if(!this.head)
        {
            this.head = node;
            return this;
        }

        let current = this.head;
        while(current.next)
        { current = current.next }
        
        current.next = node

        return this;
    }

    dropLast()
    {
        if(!this.head)
            return this;

        if(!this.head.next)
        {
            let result = this.head.value;
            this.head = null;
            return this;
        }

        let current = this.head;
        let prev = current;
        while(current.next)
        {
            prev = current;
            current = current.next;
        }
        prev.next = null;
        return this;
    }

    remove(value)
    {
        if(!this.head)
            return this;

        if(this.head.value === value)
        {
            this.head = this.head.next;
            return this;
        }

        let current = this.head;
        while(current.next)
        {
            if(current.next.value === value)
            {
                current.next = current.next.next;
                return this;
            }
            current = current.next;
        }

        return this;
    }

    print()
    {
        let current = this.head;
        let result = "";
        while(current.next)
        {
            result += current.value + ", ";
            current = current.next
        }
        result += current.value;

        console.log(result);
    }
}