import java.util.Scanner;
public class check {
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);
        System.out.println("enter yout number ");
        if (input.hasNextInt()) {
            int number = input.nextInt();
            System.out.println("you entered an integer "+number);
        }
        else{
            System.out.println("you did not enter an integer");
        }
        input.close();
        }
    }

