import java.util.Scanner;
public class percentage {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("enter your name ");
        String name =input.nextLine();
        System.out.println("enter your roll number ");
        int roll = input.nextInt();
        System.out.println("enter your marks in 5 subjects");
        int sub1 = input.nextInt();
        int sub2 = input.nextInt();
        int sub3 = input.nextInt();
        int sub4 = input.nextInt();
        int sub5 = input.nextInt();
        int sub6 = input.nextInt();
        int total = sub1 + sub2+ sub3 +sub4 + sub5 +sub6;
        float percentage  = (total/300.0f) *100;
        System.out.println( "name:" +name);
        System.out.println("roll number:" +roll);
        System.out.println("marks in 5 subjects:" +total);
        System.out.println("percentgae:" +percentage +"%");
        input.close();
        System.out.println("thank you for using this program");

    }
}